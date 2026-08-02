<?php

namespace Tests\Feature;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Mail\EventTicketMail;
use App\Mail\RegistrationOtpMail;
use App\Models\Event;
use App\Models\Registration;
use App\Models\RegistrationOtp;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GuestRegistrationTest extends TestCase
{
    public function test_guest_can_request_otp_and_receives_email(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create(['requires_approval' => false]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
            'phone' => '1234567890',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Verification code sent to your email.');

        Mail::assertQueued(RegistrationOtpMail::class, function (RegistrationOtpMail $mail) use ($event) {
            return $mail->to[0]['address'] === 'student@example.com'
                && $mail->event->id === $event->id
                && strlen($mail->otp) === 6;
        });

        $this->assertDatabaseHas('registration_otps', [
            'event_id' => $event->id,
            'email' => 'student@example.com',
            'name' => 'Jane Student',
            'phone' => '1234567890',
        ]);
    }

    public function test_request_otp_rejects_email_already_registered(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create();
        Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'already_registered');

        Mail::assertNothingSent();
    }

    public function test_request_otp_rejects_account_based_duplicate_email(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create();
        $student = $this->createUser(['email' => 'student@example.com']);
        Registration::factory()->create(['event_id' => $event->id, 'user_id' => $student->id]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'already_registered');
    }

    public function test_request_otp_rejects_when_registration_closed(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create(['registration_enabled' => false]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'registrations_closed');
    }

    public function test_request_otp_rejects_when_event_full(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create(['capacity' => 1]);
        Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'event_full');
    }

    public function test_request_otp_requires_valid_payload(): void
    {
        $event = Event::factory()->published()->create();

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'not-an-email',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'name']);
    }

    public function test_re_request_invalidates_previous_unconsumed_otp(): void
    {
        Mail::fake();

        $event = Event::factory()->published()->create();

        $this->postJson("/api/v1/events/{$event->id}/register/request", ['email' => 'student@example.com', 'name' => 'Jane']);
        $this->postJson("/api/v1/events/{$event->id}/register/request", ['email' => 'student@example.com', 'name' => 'Jane']);

        $this->assertSame(2, RegistrationOtp::query()->where('event_id', $event->id)->where('email', 'student@example.com')->count());
        $this->assertSame(1, RegistrationOtp::query()
            ->where('event_id', $event->id)
            ->where('email', 'student@example.com')
            ->whereNull('consumed_at')
            ->count());
    }

    public function test_verify_otp_with_wrong_code_fails(): void
    {
        $event = Event::factory()->published()->create();
        RegistrationOtp::factory()->withOtp('123456')->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => '000000',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'invalid_otp');

        $this->assertDatabaseMissing('registrations', ['event_id' => $event->id]);
    }

    public function test_verify_otp_with_expired_code_fails(): void
    {
        $event = Event::factory()->published()->create();
        RegistrationOtp::factory()->expired()->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => '123456',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'otp_expired');
    }

    public function test_verify_otp_with_unknown_code_fails(): void
    {
        $event = Event::factory()->published()->create();

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => '123456',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'invalid_otp');
    }

    public function test_guest_verifies_otp_stores_registration_and_issues_ticket(): void
    {
        Mail::fake();
        Storage::fake('public');

        $event = Event::factory()->published()->create(['requires_approval' => false]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane Student',
            'phone' => '1234567890',
            'attendee_details' => ['branch' => 'CSE'],
        ]);

        $otp = null;
        Mail::assertQueued(RegistrationOtpMail::class, function (RegistrationOtpMail $mail) use (&$otp) {
            $otp = $mail->otp;

            return true;
        });

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => $otp,
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'student@example.com')
            ->assertJsonPath('data.name', 'Jane Student')
            ->assertJsonPath('data.status', RegistrationStatus::CONFIRMED->value)
            ->assertJsonPath('data.ticket_number', fn ($ticket) => str_starts_with($ticket, 'DF-'));

        $registration = Registration::query()
            ->where('event_id', $event->id)
            ->where('email', 'student@example.com')
            ->firstOrFail();

        $this->assertNull($registration->user_id);
        $this->assertTrue($registration->hasIssuedTicket());

        Storage::disk('public')->assertExists($registration->ticket_qr_path);
        Storage::disk('public')->assertExists($registration->ticket_pdf_path);

        // The QR payload must be encrypted and carry the ticket payload.
        $decrypted = json_decode(Crypt::decryptString($registration->ticket_payload), true);
        $this->assertSame($registration->ticket_number, $decrypted['ticket_number']);
        $this->assertSame('student@example.com', $decrypted['attendee']['email']);

        Mail::assertQueued(EventTicketMail::class, function (EventTicketMail $mail) use ($registration) {
            return $mail->to[0]['address'] === 'student@example.com'
                && str_contains($mail->pdfPath, $registration->ticket_pdf_path);
        });

        // The OTP code is single-use, so a second attempt cannot create a duplicate.
        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => $otp,
        ])->assertUnprocessable();

        $this->assertSame(1, Registration::query()->where('event_id', $event->id)->where('email', 'student@example.com')->count());
    }

    public function test_requires_approval_guest_registration_issues_ticket_on_confirm(): void
    {
        Mail::fake();
        Storage::fake('public');

        $event = Event::factory()->published()->create(['requires_approval' => true]);
        $otp = RegistrationOtp::factory()->withOtp('123456')->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
            'name' => 'Jane Student',
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => '123456',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', RegistrationStatus::PENDING->value);

        $registration = Registration::query()->where('event_id', $event->id)->firstOrFail();
        $this->assertFalse($registration->hasIssuedTicket());
        Mail::assertNothingSent();

        app(RegistrationServiceInterface::class)->confirm($registration);

        $this->assertTrue($registration->fresh()->hasIssuedTicket());
        Mail::assertQueued(EventTicketMail::class);
    }

    public function test_manager_can_view_guest_registration_and_download_ticket(): void
    {
        Mail::fake();
        Storage::fake('public');

        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $event = Event::factory()->published()->create(['requires_approval' => false]);
        $registration = Registration::factory()->guest()->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
            'status' => RegistrationStatus::CONFIRMED->value,
        ]);

        app(RegistrationServiceInterface::class)->confirm($registration);

        $this->actingAsApi($manager)
            ->getJson("/api/v1/registrations/{$registration->id}")
            ->assertOk()
            ->assertJsonPath('data.email', 'student@example.com')
            ->assertJsonPath('data.user_id', null)
            ->assertJsonPath('data.ticket_qr_url', fn ($url) => str_contains($url, 'tickets/'));

        $response = $this->actingAsApi($manager)
            ->get("/api/v1/registrations/{$registration->id}/ticket");

        $response->assertOk();
        $this->assertStringStartsWith('%PDF', $response->streamedContent());
    }

    public function test_unauthenticated_guest_cannot_download_ticket(): void
    {
        $event = Event::factory()->published()->create();
        $registration = Registration::factory()->guest()->create(['event_id' => $event->id]);

        $this->getJson("/api/v1/registrations/{$registration->id}/ticket")
            ->assertUnauthorized();
    }

    public function test_guest_registration_count_and_cancel_decrement(): void
    {
        Mail::fake();
        Storage::fake('public');

        $event = Event::factory()->published()->create(['requires_approval' => false]);
        RegistrationOtp::factory()->withOtp('123456')->create([
            'event_id' => $event->id,
            'email' => 'student@example.com',
        ]);

        $this->postJson("/api/v1/events/{$event->id}/register/verify", [
            'email' => 'student@example.com',
            'otp' => '123456',
        ])->assertCreated();

        $this->assertDatabaseHas('events', ['id' => $event->id, 'registration_count' => 1]);

        $manager = $this->createUser([], UserRole::EVENT_MANAGER->value);
        $registration = Registration::query()->where('event_id', $event->id)->firstOrFail();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/registrations/{$registration->id}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('events', ['id' => $event->id, 'registration_count' => 0]);
    }

    public function test_event_status_must_be_visible_for_guest_registration(): void
    {
        $event = Event::factory()->create(['status' => EventStatus::DRAFT->value]);

        $this->postJson("/api/v1/events/{$event->id}/register/request", [
            'email' => 'student@example.com',
            'name' => 'Jane',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'event_not_open');
    }
}

<?php

namespace Tests\Feature;

use App\Enums\RegistrationStatus;
use App\Enums\UserRole;
use App\Mail\CertificateMail;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateModuleTest extends TestCase
{
    private function manager(): User
    {
        return $this->createUser([], UserRole::EVENT_MANAGER->value);
    }

    private function publishedEvent(): Event
    {
        return Event::factory()->published()->create();
    }

    private function attendedRegistration(Event $event, array $registration = []): Registration
    {
        $registration = Registration::factory()->create([
            'event_id' => $event->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
            ...$registration,
        ]);
        Attendance::factory()->forRegistration($registration)->create();

        return $registration;
    }

    public function test_certificate_generation_stores_pdf_and_url(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $attendee = $this->createUser();
        $this->attendedRegistration($event, ['user_id' => $attendee->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(1, 'data');

        $certificate = Certificate::query()->firstOrFail();

        Storage::disk('public')->assertExists("certificates/{$certificate->uuid}.pdf");

        $this->actingAsApi($manager)
            ->getJson("/api/v1/events/{$event->id}/certificates")
            ->assertOk()
            ->assertJsonPath('data.0.certificate_number', $certificate->certificate_number)
            ->assertJsonPath('data.0.file_url', fn ($url) => str_contains($url, 'certificates/'))
            ->assertJsonPath('data.0.attendee.name', $attendee->name);
    }

    public function test_certificate_is_downloadable_as_pdf(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated();

        $certificate = Certificate::query()->firstOrFail();

        $response = $this->actingAsApi($manager)
            ->get("/api/v1/events/{$event->id}/certificates/{$certificate->id}/download");

        $response->assertOk();
        $this->assertStringStartsWith('%PDF', $response->streamedContent());
    }

    public function test_unauthenticated_user_cannot_download_certificate(): void
    {
        Storage::fake('public');

        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($this->manager())
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated();

        $certificate = Certificate::query()->firstOrFail();

        auth()->forgetGuards();

        $this->getJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}/download")
            ->assertUnauthorized();
    }

    public function test_certificate_can_be_emailed_to_attendee(): void
    {
        Storage::fake('public');
        Mail::fake();

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, [
            'user_id' => $this->createUser(['email' => 'winner@example.com'])->id,
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated();

        $certificate = Certificate::query()->firstOrFail();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}/email")
            ->assertOk()
            ->assertJsonPath('data.emailed_at', fn ($at) => $at !== null);

        Mail::assertQueued(CertificateMail::class, function (CertificateMail $mail) use ($certificate) {
            return $mail->certificate->is($certificate) && $mail->hasTo('winner@example.com');
        });

        $this->assertNotNull($certificate->fresh()->emailed_at);
    }

    public function test_guest_certificate_is_issued_and_emailed_to_guest_email(): void
    {
        Storage::fake('public');
        Mail::fake();

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, [
            'user_id' => null,
            'name' => 'Guest Attendee',
            'email' => 'guest@example.com',
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonPath('data.0.user_id', null)
            ->assertJsonPath('data.0.attendee.name', 'Guest Attendee');

        $certificate = Certificate::query()->firstOrFail();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}/email")
            ->assertOk();

        Mail::assertQueued(CertificateMail::class, fn (CertificateMail $mail) => $mail->hasTo('guest@example.com'));
    }

    public function test_bulk_generate_issues_every_eligible_attendee(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);
        $this->attendedRegistration($event, ['user_id' => null, 'name' => 'Guest A', 'email' => 'guest-a@example.com']);
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        Registration::factory()->create([
            'event_id' => $event->id,
            'user_id' => $this->createUser()->id,
            'status' => RegistrationStatus::CHECKED_IN->value,
            'checked_in_at' => now(),
        ]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(3, 'data');

        $this->assertSame(3, Certificate::query()->whereNotNull('file_path')->count());
    }

    public function test_bulk_email_sends_only_unemailed_certificates(): void
    {
        Storage::fake('public');
        Mail::fake();

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(2, 'data');

        $first = Certificate::query()->firstOrFail();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/{$first->id}/email")
            ->assertOk();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/email")
            ->assertOk()
            ->assertJsonPath('data.sent', 1)
            ->assertJsonCount(0, 'data.skipped');

        Mail::assertQueued(CertificateMail::class, 2);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/email")
            ->assertOk()
            ->assertJsonPath('data.sent', 0);
    }

    public function test_bulk_email_can_target_specific_certificates(): void
    {
        Storage::fake('public');
        Mail::fake();

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated()
            ->assertJsonCount(2, 'data');

        $target = Certificate::query()->firstOrFail();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/email", [
                'certificate_ids' => [$target->id],
            ])
            ->assertOk()
            ->assertJsonPath('data.sent', 1);

        Mail::assertQueued(CertificateMail::class, 1);
    }

    public function test_revoked_certificate_cannot_be_downloaded_or_emailed(): void
    {
        Storage::fake('public');

        $manager = $this->manager();
        $event = $this->publishedEvent();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertCreated();

        $certificate = Certificate::query()->firstOrFail();

        $this->actingAsApi($manager)
            ->deleteJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}")
            ->assertOk();

        $this->actingAsApi($manager)
            ->get("/api/v1/events/{$event->id}/certificates/{$certificate->id}/download")
            ->assertNotFound();

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/certificates/{$certificate->id}/email")
            ->assertNotFound();
    }

    public function test_student_cannot_manage_certificates(): void
    {
        Storage::fake('public');

        $event = $this->publishedEvent();
        $student = $this->createUser();
        $this->attendedRegistration($event, ['user_id' => $this->createUser()->id]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/certificates")
            ->assertForbidden();
    }
}

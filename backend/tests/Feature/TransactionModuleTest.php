<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Transaction;
use App\Models\User;
use Tests\TestCase;

class TransactionModuleTest extends TestCase
{
    private function manager(): User
    {
        return $this->createUser([], UserRole::EVENT_MANAGER->value);
    }

    private function event(): Event
    {
        return Event::factory()->published()->create();
    }

    public function test_manager_can_record_completed_payment(): void
    {
        $manager = $this->manager();
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 250.50,
                'currency' => 'USD',
                'payment_method' => 'card',
                'reference' => 'PAY-001',
                'status' => 'completed',
            ])
            ->assertCreated()
            ->assertJsonPath('data.amount', 250.5)
            ->assertJsonPath('data.currency', 'USD')
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.user_id', $registration->user_id)
            ->assertJsonPath('data.paid_at', fn ($at) => $at !== null);

        $this->assertDatabaseHas('transactions', [
            'event_id' => $event->id,
            'registration_id' => $registration->id,
            'amount' => 250.50,
            'status' => PaymentStatus::COMPLETED->value,
        ]);
    }

    public function test_pending_payment_has_no_paid_at(): void
    {
        $manager = $this->manager();
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 100,
                'status' => 'pending',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.paid_at', null);
    }

    public function test_guest_payment_records_null_user(): void
    {
        $manager = $this->manager();
        $event = $this->event();
        $registration = Registration::factory()->guest()->create(['event_id' => $event->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 50,
                'status' => 'completed',
            ])
            ->assertCreated()
            ->assertJsonPath('data.user_id', null);

        $this->assertDatabaseHas('transactions', [
            'registration_id' => $registration->id,
            'user_id' => null,
        ]);
    }

    public function test_transaction_requires_payment_create_permission(): void
    {
        $student = $this->createUser();
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        $this->actingAsApi($student)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 10,
            ])
            ->assertForbidden();
    }

    public function test_transaction_validation(): void
    {
        $manager = $this->manager();
        $event = $this->event();
        $registration = Registration::factory()->create(['event_id' => $event->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 0,
                'status' => 'cancelled',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount', 'status']);
    }

    public function test_transaction_scoped_to_event(): void
    {
        $manager = $this->manager();
        $event = $this->event();
        $otherEvent = $this->event();
        $registration = Registration::factory()->create(['event_id' => $otherEvent->id]);

        $this->actingAsApi($manager)
            ->postJson("/api/v1/events/{$event->id}/registrations/{$registration->id}/transactions", [
                'amount' => 10,
            ])
            ->assertNotFound();
    }

    public function test_transactions_can_be_listed_and_filtered(): void
    {
        $manager = $this->manager();
        $eventA = $this->event();
        $eventB = $this->event();

        $registrationA = Registration::factory()->create(['event_id' => $eventA->id]);
        $registrationB = Registration::factory()->create(['event_id' => $eventB->id]);

        Transaction::factory()->completed()->forRegistration($registrationA)->create(['reference' => 'PAY-AAA']);
        Transaction::factory()->completed()->forRegistration($registrationB)->create(['reference' => 'PAY-BBB']);
        Transaction::factory()->forRegistration($registrationA)->create(['reference' => 'PAY-PENDING']);

        $this->actingAsApi($manager)
            ->getJson('/api/v1/transactions?event_id='.$eventA->id)
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2);

        $this->actingAsApi($manager)
            ->getJson('/api/v1/transactions?status=completed&search=PAY-AAA')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.reference', 'PAY-AAA');
    }

    public function test_unauthenticated_user_cannot_list_transactions(): void
    {
        $this->getJson('/api/v1/transactions')
            ->assertUnauthorized();
    }
}

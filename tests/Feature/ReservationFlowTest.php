<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_can_create_reservation_with_date_range_payload(): void
    {
        $driver = User::factory()->create(['role' => 'driver']);
        $vehicle = $this->makeVehicle('AA-00-BB');

        $response = $this->actingAs($driver)->postJson('/api/reservations', [
            'vehicle_id' => $vehicle->id,
            'trip' => 'Lisboa -> Porto',
            'start_date' => '2026-05-25',
            'end_date' => '2026-05-27',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('vehicle_id', $vehicle->id)
            ->assertJsonPath('trip', 'Lisboa -> Porto')
            ->assertJsonPath('status', Reservation::STATUS_PENDING);

        $reservation = Reservation::firstOrFail();

        $this->assertSame('2026-05-25', $reservation->periodStart()?->toDateString());
        $this->assertSame('2026-05-27', $reservation->periodEnd()?->toDateString());
        $this->assertSame('2026-05-25', $reservation->date?->toDateString());
    }

    public function test_manager_approval_rejects_pending_overlapping_reservations(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $driverA = User::factory()->create(['role' => 'driver']);
        $driverB = User::factory()->create(['role' => 'driver']);
        $vehicle = $this->makeVehicle('CC-11-DD');

        $approvedCandidate = Reservation::create([
            'vehicle_id' => $vehicle->id,
            'requested_by' => $driverA->id,
            'team' => $driverA->team,
            'trip' => 'Reserva A',
            'start_date' => '2026-06-10',
            'end_date' => '2026-06-12',
            'date' => '2026-06-10',
            'status' => Reservation::STATUS_PENDING,
        ]);

        $overlap = Reservation::create([
            'vehicle_id' => $vehicle->id,
            'requested_by' => $driverB->id,
            'team' => $driverB->team,
            'trip' => 'Reserva B',
            'start_date' => '2026-06-11',
            'end_date' => '2026-06-13',
            'date' => '2026-06-11',
            'status' => Reservation::STATUS_PENDING,
        ]);

        $this->actingAs($manager)
            ->postJson("/api/reservations/{$approvedCandidate->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('reservations', [
            'id' => $approvedCandidate->id,
            'status' => Reservation::STATUS_APPROVED,
        ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $overlap->id,
            'status' => Reservation::STATUS_REJECTED,
        ]);
    }

    private function makeVehicle(string $plate): Vehicle
    {
        return Vehicle::create([
            'brand' => 'Ford',
            'model' => 'Transit',
            'category' => 'van',
            'plate' => $plate,
            'seats' => 9,
            'current_km' => 1000,
            'operational' => true,
        ]);
    }
}

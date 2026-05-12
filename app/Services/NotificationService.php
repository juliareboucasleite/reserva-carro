<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;

class NotificationService
{
    public function notifyUser(
        int $userId,
        string $type,
        string $message,
        ?int $vehicleId = null,
        ?int $reservationId = null
    ): void {
        AppNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
            'vehicle_id' => $vehicleId,
            'reservation_id' => $reservationId,
        ]);
    }

    public function notifyRoles(
        array $roles,
        string $type,
        string $message,
        ?int $vehicleId = null,
        ?int $reservationId = null
    ): void {
        $users = User::whereIn('role', $roles)->pluck('id');

        foreach ($users as $userId) {
            $this->notifyUser($userId, $type, $message, $vehicleId, $reservationId);
        }
    }

    public function reservationRequested(Reservation $reservation): void
    {
        $reservation->loadMissing('vehicle', 'requester');
        $this->notifyRoles(
            ['manager', 'admin'],
            AppNotification::TYPE_RESERVATION_REQUESTED,
            ($reservation->requester?->name ?? 'Utilizador') .
                ' pediu reserva da viatura ' .
                ($reservation->vehicle?->name ?? '') .
                ' (' . $reservation->trip . ')',
            $reservation->vehicle_id,
            $reservation->id
        );
    }

    public function reservationApproved(Reservation $reservation): void
    {
        $reservation->loadMissing('vehicle');
        $this->notifyUser(
            $reservation->requested_by,
            AppNotification::TYPE_RESERVATION_APPROVED,
            'Reserva aprovada: ' . ($reservation->vehicle?->name ?? '') .
                ' (' . $reservation->trip . ') — pronta para check-in',
            $reservation->vehicle_id,
            $reservation->id
        );
    }

    public function reservationRejected(Reservation $reservation): void
    {
        $reservation->loadMissing('vehicle');
        $this->notifyUser(
            $reservation->requested_by,
            AppNotification::TYPE_RESERVATION_REJECTED,
            'Reserva rejeitada: ' . ($reservation->vehicle?->name ?? '') .
                ' (' . $reservation->trip . ')',
            $reservation->vehicle_id,
            $reservation->id
        );
    }

    public function reservationCheckedOut(Reservation $reservation): void
    {
        $reservation->loadMissing('vehicle');
        $this->notifyRoles(
            ['manager', 'admin'],
            AppNotification::TYPE_RESERVATION_CHECKED_OUT,
            'Reserva fechada: ' . ($reservation->vehicle?->name ?? '') .
                ' — ' . ($reservation->end_km !== null ? number_format($reservation->end_km, 0, ',', '.') : '?') . ' km',
            $reservation->vehicle_id,
            $reservation->id
        );
        $this->notifyRoles(
            ['manager', 'admin'],
            AppNotification::TYPE_OPERATIONAL_CONFIRMATION_NEEDED,
            'Confirmar estado operacional: ' . ($reservation->vehicle?->name ?? '') .
                ' (' . ($reservation->vehicle?->plate ?? '') . ')',
            $reservation->vehicle_id,
            $reservation->id
        );
    }

    public function vehicleNonOperational(Vehicle $vehicle): void
    {
        $this->notifyRoles(
            ['manager', 'admin'],
            AppNotification::TYPE_VEHICLE_NON_OPERATIONAL,
            'Viatura ' . $vehicle->name . ' (' . $vehicle->plate . ') marcada como não operacional',
            $vehicle->id
        );
    }
}

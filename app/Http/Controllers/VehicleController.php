<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vehicles = Vehicle::orderBy('id')->get();
        $active = $this->loadActiveReservations($vehicles->pluck('id'));
        $user = $request->user();

        return response()->json(
            $vehicles->map(fn ($v) => $this->withAvailability($v, $active->get($v->id, collect()), $user))
        );
    }

    public function show(Request $request, Vehicle $vehicle): JsonResponse
    {
        $active = $this->loadActiveReservations(collect([$vehicle->id]));
        return response()->json(
            $this->withAvailability($vehicle, $active->get($vehicle->id, collect()), $request->user())
        );
    }

    private function loadActiveReservations($vehicleIds)
    {
        return Reservation::whereIn('vehicle_id', $vehicleIds)
            ->whereIn('status', [
                Reservation::STATUS_PENDING,
                Reservation::STATUS_APPROVED,
                Reservation::STATUS_CHECKED_IN,
            ])
            ->with('requester:id,name')
            ->orderBy('date')
            ->get()
            ->groupBy('vehicle_id');
    }

    private function withAvailability(Vehicle $vehicle, $activeReservations, $user): array
    {
        $inUse = $activeReservations->firstWhere('status', Reservation::STATUS_CHECKED_IN);
        $approved = $activeReservations->firstWhere('status', Reservation::STATUS_APPROVED);
        $pending = $activeReservations->firstWhere('status', Reservation::STATUS_PENDING);

        $active = $inUse ?? $approved ?? $pending;

        if (! $vehicle->operational) {
            $availability = 'inoperational';
        } elseif ($inUse) {
            $availability = 'in_use';
        } elseif ($approved) {
            $availability = 'reserved';
        } elseif ($pending) {
            $availability = 'pre_reserved';
        } else {
            $availability = 'available';
        }

        $canSeeRequester = $user
            && (
                in_array($user->role, ['manager', 'admin'], true)
                || ($active && $active->requested_by === $user->id)
            );

        return array_merge($vehicle->toArray(), [
            'availability' => $availability,
            'active_reservation' => $active ? [
                'id' => $canSeeRequester ? $active->id : null,
                'date' => $active->date?->format('Y-m-d'),
                'status' => $active->status,
                'requester_name' => $canSeeRequester ? $active->requester?->name : null,
                'trip' => $canSeeRequester ? $active->trip : null,
            ] : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureManager($request);

        $data = $this->validateData($request);

        $vehicle = Vehicle::create($data);

        return response()->json($vehicle, 201);
    }

    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $this->ensureManager($request);

        $data = $this->validateData($request, $vehicle->id);
        $vehicle->update($data);

        return response()->json($vehicle->fresh());
    }

    public function setOperational(
        Request $request,
        Vehicle $vehicle,
        NotificationService $notifications
    ): JsonResponse {
        $this->ensureManager($request);

        $payload = $request->validate([
            'operational' => ['required', 'boolean'],
        ]);

        $previous = $vehicle->operational;
        $vehicle->update(['operational' => $payload['operational']]);

        if ($previous && ! $payload['operational']) {
            $notifications->vehicleNonOperational($vehicle);
        }

        return response()->json($vehicle->fresh());
    }

    private function validateData(Request $request, ?int $vehicleId = null): array
    {
        return $request->validate([
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:255'],
            'plate' => ['required', 'string', 'max:32', 'unique:vehicles,plate,' . ($vehicleId ?? 'NULL')],
            'seats' => ['required', 'integer', 'min:0'],
            'current_km' => ['required', 'integer', 'min:0'],
            'operational' => ['nullable', 'boolean'],
            'next_inspection' => ['nullable', 'date'],
            'insurance_company' => ['nullable', 'string', 'max:255'],
            'insurance_type' => ['nullable', 'string', 'max:255'],
            'insurance_renewal' => ['nullable', 'date'],
            'responsible' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'base' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function ensureManager(Request $request): void
    {
        $user = $request->user();
        if (! in_array($user?->role, ['manager', 'admin'], true)) {
            throw new AccessDeniedHttpException('Apenas gestores podem fazer esta operação.');
        }
    }
}

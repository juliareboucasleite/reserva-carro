<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ReservationController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Reservation::with(['vehicle', 'requester:id,name,team', 'media']);

        if (! $this->isManager($user)) {
            $query->where('requested_by', $user->id);
        }

        return response()->json($query->orderByDesc('date')->orderByDesc('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'trip' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ]);

        $user = $request->user();
        $reservation = Reservation::create([
            ...$data,
            'requested_by' => $user->id,
            'team' => $user->team,
            'status' => Reservation::STATUS_PENDING,
        ]);

        $this->notifications->reservationRequested($reservation);

        return response()->json($this->fresh($reservation), 201);
    }

    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureCanView($request, $reservation);
        return response()->json($this->fresh($reservation));
    }

    public function approve(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureManager($request);

        if ($reservation->status !== Reservation::STATUS_PENDING) {
            throw new AccessDeniedHttpException('Apenas pedidos pendentes podem ser aprovados.');
        }

        $hasConflict = Reservation::where('vehicle_id', $reservation->vehicle_id)
            ->whereDate('date', $reservation->date)
            ->where('id', '!=', $reservation->id)
            ->whereIn('status', [
                Reservation::STATUS_APPROVED,
                Reservation::STATUS_CHECKED_IN,
            ])
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'message' => 'Esta viatura já foi atribuída para essa data.',
            ], 409);
        }

        $rejectedIds = [];

        DB::transaction(function () use ($reservation, &$rejectedIds) {
            $reservation->update(['status' => Reservation::STATUS_APPROVED]);

            $competingReservations = Reservation::where('vehicle_id', $reservation->vehicle_id)
                ->whereDate('date', $reservation->date)
                ->where('id', '!=', $reservation->id)
                ->where('status', Reservation::STATUS_PENDING)
                ->get();

            foreach ($competingReservations as $competingReservation) {
                $competingReservation->update(['status' => Reservation::STATUS_REJECTED]);
                $rejectedIds[] = $competingReservation->id;
            }
        });

        $this->notifications->reservationApproved($reservation);

        if (! empty($rejectedIds)) {
            Reservation::whereIn('id', $rejectedIds)
                ->with(['vehicle', 'requester'])
                ->get()
                ->each(fn (Reservation $item) => $this->notifications->reservationRejected($item));
        }

        return response()->json($this->fresh($reservation));
    }

    public function reject(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureManager($request);
        $reservation->update(['status' => Reservation::STATUS_REJECTED]);
        $this->notifications->reservationRejected($reservation);
        return response()->json($this->fresh($reservation));
    }

    public function checkIn(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureOwner($request, $reservation);

        if ($reservation->status !== Reservation::STATUS_APPROVED) {
            throw new AccessDeniedHttpException('Reserva ainda não aprovada.');
        }

        $data = $request->validate([
            'driver' => ['required', 'string', 'max:255'],
            'start_km' => ['required', 'integer', 'min:0'],
            'start_notes' => ['nullable', 'string'],
            'media' => ['required', 'array'],
            'media.front' => ['required', 'file', 'image', 'max:20480'],
            'media.back' => ['required', 'file', 'image', 'max:20480'],
            'media.left' => ['required', 'file', 'image', 'max:20480'],
            'media.right' => ['required', 'file', 'image', 'max:20480'],
        ]);

        $reservation->update([
            'driver' => $data['driver'],
            'start_km' => $data['start_km'],
            'start_notes' => $data['start_notes'] ?? '',
            'status' => Reservation::STATUS_CHECKED_IN,
        ]);

        $this->storeAngledUploads($request, $reservation, 'start');

        return response()->json($this->fresh($reservation));
    }

    public function checkOut(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureOwner($request, $reservation);

        if ($reservation->status !== Reservation::STATUS_CHECKED_IN) {
            throw new AccessDeniedHttpException('Reserva precisa estar em curso.');
        }

        $data = $request->validate([
            'end_km' => ['required', 'integer', 'min:0'],
            'end_notes' => ['nullable', 'string'],
            'media' => ['nullable', 'array'],
            'media.front' => ['required', 'file', 'mimetypes:image/*,video/*', 'max:20480'],
            'media.back' => ['required', 'file', 'mimetypes:image/*,video/*', 'max:20480'],
            'media.left' => ['required', 'file', 'mimetypes:image/*,video/*', 'max:20480'],
            'media.right' => ['required', 'file', 'mimetypes:image/*,video/*', 'max:20480'],
        ]);

        $reservation->update([
            'end_km' => $data['end_km'],
            'end_notes' => $data['end_notes'] ?? '',
            'status' => Reservation::STATUS_CHECKED_OUT,
        ]);

        $reservation->vehicle()->update(['current_km' => $data['end_km']]);

        $this->storeAngledUploads($request, $reservation, 'end');

        $this->notifications->reservationCheckedOut($reservation);

        return response()->json($this->fresh($reservation));
    }

    public function confirmOperational(Request $request, Reservation $reservation): JsonResponse
    {
        $this->ensureManager($request);

        $data = $request->validate([
            'operational' => ['required', 'boolean'],
        ]);

        $reservation->update(['operational_confirmed' => $data['operational']]);

        if (! $data['operational']) {
            $vehicle = $reservation->vehicle;
            if ($vehicle && $vehicle->operational) {
                $vehicle->update(['operational' => false]);
                $this->notifications->vehicleNonOperational($vehicle);
            }
        }

        return response()->json($this->fresh($reservation));
    }

    private function storeUploads(Request $request, Reservation $reservation, string $phase): void
    {
        $files = $request->file('media', []);
        if (! is_array($files)) {
            $files = [$files];
        }

        foreach ($files as $file) {
            if (! $file) continue;
            $path = $file->store('reservation-media/' . $reservation->id, 'public');
            $reservation->media()->create([
                'phase' => $phase,
                'path' => $path,
                'mime' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);
        }
    }

    private function storeAngledUploads(Request $request, Reservation $reservation, string $phase): void
    {
        $angles = ['front', 'back', 'left', 'right'];
        foreach ($angles as $angle) {
            $file = $request->file("media.$angle");
            if (! $file) continue;
            $path = $file->store('reservation-media/' . $reservation->id, 'public');
            $reservation->media()->create([
                'phase' => $phase,
                'angle' => $angle,
                'path' => $path,
                'mime' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);
        }
    }

    private function fresh(Reservation $reservation): Reservation
    {
        return $reservation->fresh(['vehicle', 'requester:id,name,team', 'media']);
    }

    private function isManager(?\App\Models\User $user): bool
    {
        return $user && in_array($user->role, ['manager', 'admin'], true);
    }

    private function ensureManager(Request $request): void
    {
        if (! $this->isManager($request->user())) {
            throw new AccessDeniedHttpException('Apenas gestores podem fazer esta operação.');
        }
    }

    private function ensureOwner(Request $request, Reservation $reservation): void
    {
        if ($request->user()->id !== $reservation->requested_by) {
            throw new AccessDeniedHttpException('Apenas o requisitante pode fazer esta operação.');
        }
    }

    private function ensureCanView(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        if ($this->isManager($user)) return;
        if ($user->id === $reservation->requested_by) return;
        throw new AccessDeniedHttpException('Sem acesso a esta reserva.');
    }
}

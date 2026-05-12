<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationDamage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DamageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isManager = in_array($user->role, ['manager', 'admin'], true);

        $query = ReservationDamage::with([
            'reservation.vehicle:id,brand,model,plate,category',
            'reservation.requester:id,name',
            'costSetter:id,name',
        ])->orderByDesc('created_at');

        if (! $isManager) {
            $reservationIds = Reservation::where('requested_by', $user->id)->pluck('id');
            $query->whereIn('reservation_id', $reservationIds);
        }

        return response()->json($query->get());
    }

    public function store(Request $request, Reservation $reservation): JsonResponse
    {
        if ($request->user()->id !== $reservation->requested_by) {
            throw new AccessDeniedHttpException('Apenas o condutor da reserva pode reportar danos.');
        }

        $data = $request->validate([
            'x' => ['required', 'numeric', 'min:0', 'max:1'],
            'y' => ['required', 'numeric', 'min:0', 'max:1'],
            'damage_type' => ['required', 'string', 'in:scratch,dent,crack,clip'],
            'severity' => ['required', 'string', 'in:low,high'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'file', 'image', 'max:20480'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store(
                'reservation-damages/' . $reservation->id,
                'public'
            );
        }

        $damage = $reservation->damages()->create([
            'x' => $data['x'],
            'y' => $data['y'],
            'damage_type' => $data['damage_type'],
            'severity' => $data['severity'],
            'description' => $data['description'] ?? null,
            'photo_path' => $photoPath,
        ]);

        return response()->json($this->fresh($damage), 201);
    }

    public function setCost(Request $request, ReservationDamage $damage): JsonResponse
    {
        $user = $request->user();
        if (! in_array($user->role, ['manager', 'admin'], true)) {
            throw new AccessDeniedHttpException('Apenas gestores podem definir custos.');
        }

        $data = $request->validate([
            'cost' => ['required', 'numeric', 'min:0'],
            'response_message' => ['nullable', 'string'],
        ]);

        $damage->update([
            'cost' => $data['cost'],
            'response_message' => $data['response_message'] ?? null,
            'cost_set_by' => $user->id,
            'cost_set_at' => now(),
        ]);

        return response()->json($this->fresh($damage));
    }

    private function fresh(ReservationDamage $damage): ReservationDamage
    {
        return $damage->fresh([
            'reservation.vehicle:id,brand,model,plate,category',
            'reservation.requester:id,name',
            'costSetter:id,name',
        ]);
    }
}

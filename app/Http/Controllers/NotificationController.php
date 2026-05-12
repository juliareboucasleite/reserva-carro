<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isManager = in_array($user->role, ['manager', 'admin'], true);

        $stored = AppNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn ($n) => [
                'id' => 'evt-' . $n->id,
                'type' => $n->type,
                'message' => $n->message,
                'vehicle_id' => $n->vehicle_id,
                'reservation_id' => $n->reservation_id,
                'created_at' => $n->created_at?->timestamp * 1000,
                'read' => $n->read_at !== null,
                'kind' => 'event',
            ]);

        $derived = collect();
        if ($isManager) {
            $today = Carbon::today();
            foreach (Vehicle::all() as $vehicle) {
                $insp = $vehicle->next_inspection;
                if ($insp) {
                    $days = (int) round($today->diffInDays($insp, false));
                    if ($days <= 30) {
                        $derived->push([
                            'id' => 'insp-' . $vehicle->id . '-' . $insp->format('Y-m-d'),
                            'type' => AppNotification::TYPE_INSPECTION_DUE,
                            'message' => $this->dueMessage('Inspeção', $vehicle, $days),
                            'vehicle_id' => $vehicle->id,
                            'reservation_id' => null,
                            'created_at' => now()->timestamp * 1000,
                            'days' => $days,
                            'read' => false,
                            'kind' => 'derived',
                        ]);
                    }
                }

                $ren = $vehicle->insurance_renewal;
                if ($ren) {
                    $days = (int) round($today->diffInDays($ren, false));
                    if ($days <= 30) {
                        $derived->push([
                            'id' => 'ins-' . $vehicle->id . '-' . $ren->format('Y-m-d'),
                            'type' => AppNotification::TYPE_INSURANCE_DUE,
                            'message' => $this->dueMessage('Seguro', $vehicle, $days),
                            'vehicle_id' => $vehicle->id,
                            'reservation_id' => null,
                            'created_at' => now()->timestamp * 1000,
                            'days' => $days,
                            'read' => false,
                            'kind' => 'derived',
                        ]);
                    }
                }
            }
        }

        return response()->json($stored->merge($derived)->values());
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $notification = AppNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();
        $notification->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }

    private function dueMessage(string $label, Vehicle $vehicle, int $days): string
    {
        $vehicleLabel = $vehicle->name . ' (' . $vehicle->plate . ')';
        return match (true) {
            $days < 0 => $label . ' vencido: ' . $vehicleLabel,
            $days === 0 => $label . ' hoje: ' . $vehicleLabel,
            default => $label . ' em ' . $days . ' dia' . ($days === 1 ? '' : 's') . ': ' . $vehicleLabel,
        };
    }
}

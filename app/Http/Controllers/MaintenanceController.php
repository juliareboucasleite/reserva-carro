<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class MaintenanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            MaintenanceRecord::with('vehicle:id,brand,model,plate')
                ->orderByDesc('date')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureManager($request);

        $data = $request->validate([
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'date' => ['required', 'date'],
            'type' => ['required', 'string', 'max:255'],
            'downtime_days' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $record = MaintenanceRecord::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($record->fresh('vehicle:id,brand,model,plate'), 201);
    }

    private function ensureManager(Request $request): void
    {
        if (! in_array($request->user()?->role, ['manager', 'admin'], true)) {
            throw new AccessDeniedHttpException('Apenas gestores podem registar manutenção.');
        }
    }
}

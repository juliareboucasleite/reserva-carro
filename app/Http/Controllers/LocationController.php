<?php

namespace App\Http\Controllers;

use App\Services\Locations\LocationSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function __construct(private readonly LocationSearchService $locations)
    {
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'query' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string', 'in:all,airport,city,district,station'],
        ]);

        return response()->json(
            $this->locations->autocomplete($data['query'] ?? '', $data['type'] ?? 'all')
        );
    }

    public function route(Request $request): JsonResponse
    {
        $data = $request->validate([
            'origin' => ['required', 'array'],
            'origin.label' => ['required', 'string', 'max:255'],
            'origin.city' => ['required', 'string', 'max:120'],
            'origin.country' => ['required', 'string', 'max:120'],
            'origin.type' => ['nullable', 'string', 'in:airport,city,district,station'],
            'origin.lat' => ['required', 'numeric', 'between:-90,90'],
            'origin.lng' => ['required', 'numeric', 'between:-180,180'],
            'destination' => ['required', 'array'],
            'destination.label' => ['required', 'string', 'max:255'],
            'destination.city' => ['required', 'string', 'max:120'],
            'destination.country' => ['required', 'string', 'max:120'],
            'destination.type' => ['nullable', 'string', 'in:airport,city,district,station'],
            'destination.lat' => ['required', 'numeric', 'between:-90,90'],
            'destination.lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        return response()->json(
            $this->locations->estimateRoute($data['origin'], $data['destination'])
        );
    }
}

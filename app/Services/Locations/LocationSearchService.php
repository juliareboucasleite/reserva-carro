<?php

namespace App\Services\Locations;

class LocationSearchService
{
    private const LOCAL_CATALOG = [
        [
            'id' => 'lisboa-city',
            'label' => 'Lisboa, Portugal',
            'city' => 'Lisboa',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 38.7223,
            'lng' => -9.1393,
            'featured' => true,
            'search_terms' => ['lisboa', 'lisbon', 'capital'],
        ],
        [
            'id' => 'lisboa-airport',
            'label' => 'Aeroporto Humberto Delgado (LIS), Lisboa, Portugal',
            'city' => 'Lisboa',
            'country' => 'Portugal',
            'type' => 'airport',
            'lat' => 38.7742,
            'lng' => -9.1342,
            'featured' => true,
            'search_terms' => ['lis', 'aeroporto lisboa', 'humberto delgado', 'airport lisbon'],
        ],
        [
            'id' => 'lisboa-santa-apolonia',
            'label' => 'Estação Santa Apolónia, Lisboa, Portugal',
            'city' => 'Lisboa',
            'country' => 'Portugal',
            'type' => 'station',
            'lat' => 38.7137,
            'lng' => -9.1228,
            'featured' => true,
            'search_terms' => ['santa apolonia', 'estacao lisboa'],
        ],
        [
            'id' => 'lisboa-oriente',
            'label' => 'Estação Gare do Oriente, Lisboa, Portugal',
            'city' => 'Lisboa',
            'country' => 'Portugal',
            'type' => 'station',
            'lat' => 38.7674,
            'lng' => -9.0995,
            'featured' => true,
            'search_terms' => ['oriente', 'gare do oriente', 'estacao oriente'],
        ],
        [
            'id' => 'porto-city',
            'label' => 'Porto, Portugal',
            'city' => 'Porto',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 41.1579,
            'lng' => -8.6291,
            'featured' => true,
            'search_terms' => ['porto', 'oporto'],
        ],
        [
            'id' => 'porto-airport',
            'label' => 'Aeroporto Francisco Sá Carneiro (OPO), Porto, Portugal',
            'city' => 'Porto',
            'country' => 'Portugal',
            'type' => 'airport',
            'lat' => 41.2481,
            'lng' => -8.6814,
            'featured' => true,
            'search_terms' => ['opo', 'aeroporto porto', 'sa carneiro'],
        ],
        [
            'id' => 'coimbra-city',
            'label' => 'Coimbra, Portugal',
            'city' => 'Coimbra',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 40.2033,
            'lng' => -8.4103,
            'featured' => true,
            'search_terms' => ['coimbra'],
        ],
        [
            'id' => 'coimbra-b',
            'label' => 'Estação Coimbra-B, Coimbra, Portugal',
            'city' => 'Coimbra',
            'country' => 'Portugal',
            'type' => 'station',
            'lat' => 40.2239,
            'lng' => -8.4405,
            'featured' => true,
            'search_terms' => ['coimbra-b', 'estacao coimbra'],
        ],
        [
            'id' => 'celas',
            'label' => 'Celas, Coimbra, Portugal',
            'city' => 'Coimbra',
            'country' => 'Portugal',
            'type' => 'district',
            'lat' => 40.2145,
            'lng' => -8.4108,
            'featured' => false,
            'search_terms' => ['celas', 'bairro coimbra'],
        ],
        [
            'id' => 'norton-matos',
            'label' => 'Norton de Matos, Coimbra, Portugal',
            'city' => 'Coimbra',
            'country' => 'Portugal',
            'type' => 'district',
            'lat' => 40.1987,
            'lng' => -8.4298,
            'featured' => false,
            'search_terms' => ['norton de matos', 'bairro norton'],
        ],
        [
            'id' => 'figueira-city',
            'label' => 'Figueira da Foz, Portugal',
            'city' => 'Figueira da Foz',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 40.1508,
            'lng' => -8.8618,
            'featured' => true,
            'search_terms' => ['figueira', 'figueira da foz'],
        ],
        [
            'id' => 'figueira-buarcos',
            'label' => 'Buarcos, Figueira da Foz, Portugal',
            'city' => 'Figueira da Foz',
            'country' => 'Portugal',
            'type' => 'district',
            'lat' => 40.1698,
            'lng' => -8.8762,
            'featured' => false,
            'search_terms' => ['buarcos'],
        ],
        [
            'id' => 'aveiro-city',
            'label' => 'Aveiro, Portugal',
            'city' => 'Aveiro',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 40.6405,
            'lng' => -8.6538,
            'featured' => false,
            'search_terms' => ['aveiro'],
        ],
        [
            'id' => 'braga-city',
            'label' => 'Braga, Portugal',
            'city' => 'Braga',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 41.5454,
            'lng' => -8.4265,
            'featured' => false,
            'search_terms' => ['braga'],
        ],
        [
            'id' => 'faro-city',
            'label' => 'Faro, Portugal',
            'city' => 'Faro',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 37.0194,
            'lng' => -7.9304,
            'featured' => false,
            'search_terms' => ['faro'],
        ],
        [
            'id' => 'faro-airport',
            'label' => 'Aeroporto de Faro (FAO), Faro, Portugal',
            'city' => 'Faro',
            'country' => 'Portugal',
            'type' => 'airport',
            'lat' => 37.0144,
            'lng' => -7.9659,
            'featured' => false,
            'search_terms' => ['fao', 'aeroporto faro'],
        ],
        [
            'id' => 'setubal-city',
            'label' => 'Setúbal, Portugal',
            'city' => 'Setúbal',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 38.5244,
            'lng' => -8.8882,
            'featured' => false,
            'search_terms' => ['setubal', 'setúbal'],
        ],
        [
            'id' => 'viseu-city',
            'label' => 'Viseu, Portugal',
            'city' => 'Viseu',
            'country' => 'Portugal',
            'type' => 'city',
            'lat' => 40.6566,
            'lng' => -7.9125,
            'featured' => false,
            'search_terms' => ['viseu'],
        ],
    ];

    public function autocomplete(string $query = '', string $type = 'all'): array
    {
        $query = mb_strtolower(trim($query));
        $type = $this->normalizeType($type);

        $options = collect(self::LOCAL_CATALOG)
            ->filter(fn (array $place) => $type === 'all' || $place['type'] === $type)
            ->map(function (array $place) use ($query) {
                $score = $this->scorePlace($place, $query);

                return [
                    'place' => $place,
                    'score' => $score,
                ];
            })
            ->filter(function (array $item) use ($query) {
                if ($query === '') {
                    return $item['place']['featured'] ?? false;
                }

                return $item['score'] > 0;
            })
            ->sortByDesc(fn (array $item) => $item['score'])
            ->take(8)
            ->map(fn (array $item) => $this->serializePlace($item['place']))
            ->values()
            ->all();

        if ($query === '' && count($options) < 6) {
            $fallback = collect(self::LOCAL_CATALOG)
                ->filter(fn (array $place) => $type === 'all' || $place['type'] === $type)
                ->take(8 - count($options))
                ->map(fn (array $place) => $this->serializePlace($place))
                ->all();

            $options = array_values(array_unique([...$options, ...$fallback], SORT_REGULAR));
        }

        return [
            'provider' => config('services.location_search.provider', 'local'),
            'options' => $options,
        ];
    }

    public function estimateRoute(array $origin, array $destination): array
    {
        $distance = $this->haversineKm(
            (float) $origin['lat'],
            (float) $origin['lng'],
            (float) $destination['lat'],
            (float) $destination['lng']
        );

        $sameCity = mb_strtolower($origin['city']) === mb_strtolower($destination['city']);
        $roadFactor = $sameCity ? 1.22 : 1.14;
        $distanceKm = round(max($distance * $roadFactor, 2.4), 1);
        $averageSpeed = $sameCity ? 26 : 78;
        $durationMin = (int) max(8, round(($distanceKm / $averageSpeed) * 60));
        $scope = $sameCity ? 'urban' : 'intercity';

        return [
            'provider' => config('services.location_search.provider', 'local'),
            'route' => [
                'origin' => $this->serializeSelectedPlace($origin),
                'destination' => $this->serializeSelectedPlace($destination),
                'distance_km' => $distanceKm,
                'duration_min' => $durationMin,
                'same_city' => $sameCity,
                'scope' => $scope,
                'scope_label' => $sameCity ? 'Viagem urbana' : 'Viagem intermunicipal',
            ],
        ];
    }

    private function scorePlace(array $place, string $query): int
    {
        if ($query === '') {
            return ($place['featured'] ?? false) ? 5 : 1;
        }

        $score = 0;
        $label = mb_strtolower($place['label']);
        $city = mb_strtolower($place['city']);

        if (str_starts_with($label, $query)) {
            $score += 12;
        }

        if (str_starts_with($city, $query)) {
            $score += 10;
        }

        if (str_contains($label, $query)) {
            $score += 8;
        }

        if (str_contains($city, $query)) {
            $score += 6;
        }

        foreach ($place['search_terms'] as $term) {
            if (str_contains(mb_strtolower($term), $query)) {
                $score += 4;
            }
        }

        if ($place['featured'] ?? false) {
            $score += 1;
        }

        return $score;
    }

    private function normalizeType(string $type): string
    {
        return in_array($type, ['all', 'airport', 'city', 'district', 'station'], true)
            ? $type
            : 'all';
    }

    private function serializePlace(array $place): array
    {
        return [
            'id' => $place['id'],
            'label' => $place['label'],
            'city' => $place['city'],
            'country' => $place['country'],
            'type' => $place['type'],
            'type_label' => $this->typeLabel($place['type']),
            'lat' => $place['lat'],
            'lng' => $place['lng'],
        ];
    }

    private function serializeSelectedPlace(array $place): array
    {
        return [
            'label' => $place['label'],
            'city' => $place['city'],
            'country' => $place['country'],
            'type' => $place['type'] ?? 'city',
        ];
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'airport' => 'Aeroporto',
            'district' => 'Bairro',
            'station' => 'Estação',
            default => 'Cidade',
        };
    }

    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}

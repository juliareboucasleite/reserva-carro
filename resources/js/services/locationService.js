import axios from 'axios';

export async function searchLocations(query, type = 'all') {
    const { data } = await axios.get('/locations/autocomplete', {
        params: { query, type },
    });

    return data;
}

export async function estimateRoute(origin, destination) {
    const { data } = await axios.post('/locations/route', {
        origin: {
            label: origin.label,
            city: origin.city,
            country: origin.country,
            type: origin.type,
            lat: origin.lat,
            lng: origin.lng,
        },
        destination: {
            label: destination.label,
            city: destination.city,
            country: destination.country,
            type: destination.type,
            lat: destination.lat,
            lng: destination.lng,
        },
    });

    return data;
}

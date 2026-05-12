import React from 'react';
import { resolveVehicleImage } from '../utils/vehicleImages';

export default function VehicleMedia({
    vehicle,
    className = '',
    imageClassName = '',
    alt,
}) {
    const src = resolveVehicleImage(vehicle?.image);

    if (src) {
        return (
            <img
                src={src}
                alt={alt || vehicle.name}
                className={imageClassName || className}
                loading="lazy"
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center bg-paper-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted ${className}`}
        >
            {vehicle?.category || 'veiculo'}
        </div>
    );
}

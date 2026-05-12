import React from 'react';

export default function VehicleMedia({
    vehicle,
    className = '',
    imageClassName = '',
    alt,
}) {
    if (vehicle?.image) {
        return (
            <img
                src={vehicle.image}
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

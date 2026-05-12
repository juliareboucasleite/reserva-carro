import React from 'react';
import { VehicleArt } from './Icons';

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

    return <VehicleArt category={vehicle?.category} className={className} />;
}

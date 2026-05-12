import sedanExterior from '../../img/exterior/car-sedan-exterior.svg';
import sedanInterior from '../../img/exterior/car-sedan-interior.svg';
import suvExterior from '../../img/exterior/car-suv-exterior.svg';
import minivanExterior from '../../img/exterior/car-minivan-exterior.webp';
import minivanInterior from '../../img/exterior/car-minivan-interior.svg';
import wagonExterior from '../../img/exterior/car-wagon-exterior.svg';

const CATEGORY_SVG = {
    car: {
        exterior: sedanExterior,
        interior: sedanInterior,
    },
    suv: {
        exterior: suvExterior,
        interior: sedanInterior,
    },
    van: {
        exterior: minivanExterior,
        interior: minivanInterior,
    },
    bus: {
        exterior: minivanExterior,
        interior: minivanInterior,
    },
    wagon: {
        exterior: wagonExterior,
        interior: sedanInterior,
    },
};

const VEHICLE_NAME_OVERRIDES = [
    { match: /ford transit/i, key: 'van' },
    { match: /vw transporter/i, key: 'van' },
    { match: /mitsubishi l400/i, key: 'van' },
    { match: /opel vivaro/i, key: 'van' },
    { match: /opel benfica/i, key: 'van' },
    { match: /marcopolo iveco/i, key: 'bus' },
    { match: /autocarro man/i, key: 'bus' },
];

function resolveVehicleKey(category, vehicleName = '') {
    const override = VEHICLE_NAME_OVERRIDES.find((entry) => entry.match.test(vehicleName || ''));
    if (override) return override.key;
    return category in CATEGORY_SVG ? category : 'car';
}

export function resolveVehicleSvg(category, view = 'exterior', vehicleName = '') {
    const key = resolveVehicleKey(category, vehicleName);
    const entry = CATEGORY_SVG[key] || CATEGORY_SVG.car;
    return entry[view] || entry.exterior || sedanExterior;
}

export function hasVehicleSvgView(category, view = 'exterior', vehicleName = '') {
    const key = resolveVehicleKey(category, vehicleName);
    const entry = CATEGORY_SVG[key] || CATEGORY_SVG.car;
    return Boolean(entry[view]);
}

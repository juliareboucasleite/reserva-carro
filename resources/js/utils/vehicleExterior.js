import sedan from '../../img/exterior/car-sedan-exterior.svg';
import suv from '../../img/exterior/car-suv-exterior.svg';
import minivan from '../../img/exterior/car-minivan-exterior.svg';
import wagon from '../../img/exterior/car-wagon-exterior.svg';

const CATEGORY_SVG = {
    car: sedan,
    suv: suv,
    van: minivan,
    bus: minivan,
    wagon: wagon,
};

export function resolveExteriorSvg(category) {
    return CATEGORY_SVG[category] || sedan;
}

import fordTransit from '../../img/carros/ford-transit.webp';
import vwTransporter from '../../img/carros/vw-transporter.webp';
import mitsubishiL400 from '../../img/carros/mitsubishi-l400.webp';
import opelVivaro from '../../img/carros/opel-vivaro.webp';
import opelBenfica from '../../img/carros/opel-benfica.webp';
import marcopoloIveco from '../../img/carros/marcopolo-iveco.webp';
import manBus from '../../img/carros/man-bus.webp';

const IMAGE_MAP = {
    'ford-transit.webp': fordTransit,
    'vw-transporter.webp': vwTransporter,
    'mitsubishi-l400.webp': mitsubishiL400,
    'opel-vivaro.webp': opelVivaro,
    'opel-benfica.webp': opelBenfica,
    'marcopolo-iveco.webp': marcopoloIveco,
    'man-bus.webp': manBus,
};

export function resolveVehicleImage(value) {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('/')) return value;
    return IMAGE_MAP[value] || null;
}

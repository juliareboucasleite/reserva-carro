export type LocationKind = 'airport' | 'city' | 'neighborhood';

export type LocationOption = {
  id: string;
  label: string;
  kind: LocationKind;
};

export type BookingScreen =
  | 'home'
  | 'notifications'
  | 'benefits'
  | 'location-pickup'
  | 'location-return'
  | 'time-picker'
  | 'results'
  | 'map'
  | 'configure';

export type LocationFilter = 'all' | LocationKind;

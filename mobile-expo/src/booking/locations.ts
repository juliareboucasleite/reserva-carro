import type { LocationOption } from './types';

export const LOCATIONS: LocationOption[] = [
  { id: 'opo', label: 'Aeroporto do Porto, OPO, Portugal', kind: 'airport' },
  { id: 'lis', label: 'Aeroporto de Lisboa, LIS, Portugal', kind: 'airport' },
  { id: 'fao', label: 'Aeroporto de Faro, FAO, Portugal', kind: 'airport' },
  { id: 'fnc', label: 'Aeroporto do Funchal, FNC, Portugal', kind: 'airport' },
  { id: 'coimbra', label: 'Coimbra, Portugal', kind: 'city' },
  { id: 'porto', label: 'Porto, Portugal', kind: 'city' },
  { id: 'lisboa', label: 'Lisboa, Portugal', kind: 'city' },
  { id: 'braga', label: 'Braga, Portugal', kind: 'city' },
  { id: 'cantanhede', label: 'Cantanhede, Portugal', kind: 'city' },
  { id: 'sangalhos', label: 'Sangalhos, Portugal', kind: 'city' },
  { id: 'aveiro', label: 'Aveiro, Portugal', kind: 'city' },
  { id: 'leiria', label: 'Leiria, Portugal', kind: 'city' },
  { id: 'santa-maria', label: 'Santa Maria da Feira, Portugal', kind: 'city' },
  { id: 'lis-oriente', label: 'Estação de Lisboa Oriente, Portugal', kind: 'neighborhood' },
  { id: 'baixa', label: 'Baixa, Lisboa, Portugal', kind: 'neighborhood' },
];

export const NEAR_PICKUP: LocationOption[] = [
  { id: 'coimbra', label: 'Coimbra, Portugal', kind: 'city' },
  { id: 'cantanhede', label: 'Cantanhede, Portugal', kind: 'city' },
  { id: 'sangalhos', label: 'Sangalhos, Portugal', kind: 'city' },
  { id: 'aveiro', label: 'Aveiro, Portugal', kind: 'city' },
  { id: 'leiria', label: 'Leiria, Portugal', kind: 'city' },
  { id: 'santa-maria', label: 'Santa Maria da Feira, Portugal', kind: 'city' },
];

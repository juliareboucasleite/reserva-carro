export type TimePeriod = 'dawn' | 'morning' | 'afternoon' | 'night';

export type TimeSection = {
  period: TimePeriod;
  slots: string[];
};

function rangeSlots(startH: number, startM: number, endH: number, endM: number): string[] {
  const slots: string[] = [];
  let h = startH;
  let m = startM;
  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return slots;
}

export const TIME_SECTIONS: TimeSection[] = [
  { period: 'dawn', slots: rangeSlots(0, 0, 5, 30) },
  { period: 'morning', slots: rangeSlots(6, 0, 11, 30) },
  { period: 'afternoon', slots: rangeSlots(12, 0, 17, 30) },
  { period: 'night', slots: rangeSlots(18, 0, 23, 30) },
];

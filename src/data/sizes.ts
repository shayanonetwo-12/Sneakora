import type { SizeSystem } from '@/types';

export const sizeChart: Record<SizeSystem, number[]> = {
  EU: [38, 39, 40, 41, 42, 43, 44, 45],
  US: [5, 6, 7, 8, 9, 10, 11, 12],
  UK: [4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5],
  CM: [24, 24.7, 25.4, 26, 26.7, 27.3, 28, 28.7],
};

export function convertSize(eu: number, system: SizeSystem): string {
  const idx = sizeChart.EU.indexOf(eu);
  if (idx === -1) return String(eu);
  const val = sizeChart[system][idx];
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

export function euFromSystem(value: number, system: SizeSystem): number {
  const idx = sizeChart[system].indexOf(value);
  if (idx === -1) return -1;
  return sizeChart.EU[idx];
}

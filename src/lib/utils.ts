import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '';
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

export function formatPercentValue(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

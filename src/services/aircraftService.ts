// src/services/aircraftService.ts
import { apiFetch } from './api';

export interface Aircraft {
  ident: string;
  type: string;
  economySeats: number;
  base: string;
}

export async function getAircrafts(): Promise<Aircraft[]> {
  return await apiFetch<Aircraft[]>('/aircrafts');
}

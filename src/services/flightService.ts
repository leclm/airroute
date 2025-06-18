import { apiFetch } from './api';

export interface Flight {
  ident: string;
  departuretime: number;
  arrivaltime: number;
  readable_departure: string;
  readable_arrival: string;
  origin: string;
  destination: string;
}

export async function getFlights(): Promise<Flight[]> {
  return await apiFetch<Flight[]>('/flights');
}

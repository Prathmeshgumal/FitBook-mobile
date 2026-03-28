import { authFetch } from './client';

export interface Gym {
  id: number;
  owner_id: number;
  name: string;
  gym_type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  opening_hours: string | null;
  logo_url: string | null;
  member_serial: number;
  payment_methods: { enabled: boolean; options: string[] };
  created_at: string;
}

export interface Plan {
  id: number;
  gym_id: number;
  name: string;
  price: string;
  duration_value: number;
  duration_unit: 'months' | 'days';
  is_active: boolean;
  created_at: string;
}

export interface Batch {
  id: number;
  gym_id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

// ── Gym ──────────────────────────────────────────────────────

export async function createGym(payload: {
  name: string;
  gym_type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  opening_hours?: string;
  logo_url?: string;
}): Promise<Gym> {
  return authFetch('/gyms', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getMyGym(): Promise<Gym | null> {
  return authFetch('/gyms/mine');
}

export async function updateGym(gymId: number, payload: Partial<{
  name: string;
  gym_type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  opening_hours: string;
  logo_url: string;
  payment_methods: { enabled: boolean; options: string[] };
}>): Promise<Gym> {
  return authFetch(`/gyms/${gymId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

// ── Plans ─────────────────────────────────────────────────────

export async function listPlans(gymId: number): Promise<Plan[]> {
  return authFetch(`/gyms/${gymId}/plans`);
}

export async function createPlan(gymId: number, payload: {
  name: string;
  price: number;
  duration_value: number;
  duration_unit: 'months' | 'days';
}): Promise<Plan> {
  return authFetch(`/gyms/${gymId}/plans`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function deletePlan(gymId: number, planId: number): Promise<void> {
  return authFetch(`/gyms/${gymId}/plans/${planId}`, { method: 'DELETE' });
}

// ── Batches ───────────────────────────────────────────────────

export async function listBatches(gymId: number): Promise<Batch[]> {
  return authFetch(`/gyms/${gymId}/batches`);
}

export async function createBatch(gymId: number, payload: {
  name: string;
  start_time: string;
  end_time: string;
}): Promise<Batch> {
  return authFetch(`/gyms/${gymId}/batches`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteBatch(gymId: number, batchId: number): Promise<void> {
  return authFetch(`/gyms/${gymId}/batches/${batchId}`, { method: 'DELETE' });
}

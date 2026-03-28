import { authFetch } from './client';

export interface Member {
  id: string;
  gym_id: string;
  membership_id: string;
  full_name: string;
  gender: 'male' | 'female' | 'other' | null;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  // Joined fields from listMembers
  plan_name?: string | null;
  batch_name?: string | null;
  expiry_date?: string | null;
  due_amount?: string | null;
}

export interface Payment {
  id: string;
  membership_id: string;
  amount: string;
  payment_date: string;
  payment_method: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  plan_id: string;
  batch_id: string | null;
  purchase_date: string;
  expiry_date: string;
  full_amount: string;
  discount: string;
  admission_fees: string;
  comments: string | null;
  payment_method: string | null;
  plan_name: string;
  batch_name: string | null;
  total_paid: string;
  payments: Payment[];
}

export interface MemberDetail extends Member {
  memberships: Membership[];
}

// ── Members ───────────────────────────────────────────────────

export async function listMembers(gymId: string, params?: {
  search?: string;
  gender?: string;
  plan_id?: string;
  sort?: 'newest' | 'oldest';
}): Promise<Member[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.gender) query.set('gender', params.gender);
  if (params?.plan_id) query.set('plan_id', params.plan_id);
  if (params?.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return authFetch(`/gyms/${gymId}/members${qs ? `?${qs}` : ''}`);
}

export async function createMember(gymId: string, payload: {
  full_name: string;
  gender?: string;
  phone: string;
  membership_id?: string;
  plan_id: string;
  batch_id?: string;
  purchase_date: string;
  paid_amount?: number;
  payment_method?: string;
  discount?: number;
  admission_fees?: number;
  comments?: string;
}): Promise<Member> {
  return authFetch(`/gyms/${gymId}/members`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function getMemberDetail(memberId: string): Promise<MemberDetail> {
  return authFetch(`/members/${memberId}`);
}

export async function updateMember(memberId: string, payload: Partial<{
  full_name: string;
  gender: string;
  phone: string;
  email: string;
  date_of_birth: string;
  address: string;
  notes: string;
  is_blocked: boolean;
}>): Promise<Member> {
  return authFetch(`/members/${memberId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteMember(memberId: string): Promise<void> {
  return authFetch(`/members/${memberId}`, { method: 'DELETE' });
}

// ── Memberships ───────────────────────────────────────────────

export async function renewMembership(memberId: string, payload: {
  plan_id: string;
  batch_id?: string;
  purchase_date: string;
  paid_amount?: number;
  payment_method?: string;
  discount?: number;
  admission_fees?: number;
  comments?: string;
}): Promise<Membership> {
  return authFetch(`/members/${memberId}/memberships`, { method: 'POST', body: JSON.stringify(payload) });
}

// ── Payments ──────────────────────────────────────────────────

export async function addPayment(memberId: string, payload: {
  membership_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
}): Promise<Payment> {
  return authFetch(`/members/${memberId}/payments`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function deletePayment(memberId: string, paymentId: string): Promise<void> {
  return authFetch(`/members/${memberId}/payments/${paymentId}`, { method: 'DELETE' });
}

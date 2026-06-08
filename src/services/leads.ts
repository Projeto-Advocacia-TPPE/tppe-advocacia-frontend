import {
  apiRequest,
  PaginatedResponse,
  SuccessResponse,
} from './api';

export type LeadStatus = 'novo' | 'em_atendimento' | 'fechado' | 'descartado';

export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
};

export type LeadCreate = {
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
};

export type UserOption = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
};

export async function createLead(payload: LeadCreate): Promise<Lead> {
  const response = await apiRequest<SuccessResponse<Lead>>('/leads', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function listLeads(params: {
  page?: number;
  limit?: number;
  status?: LeadStatus | '';
  assignedTo?: number | '';
} = {}): Promise<PaginatedResponse<Lead>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.status) query.set('status', params.status);
  if (params.assignedTo) query.set('assigned_to', String(params.assignedTo));
  return apiRequest(`/leads?${query}`);
}

export async function updateLead(
  leadId: number,
  payload: { status?: LeadStatus; assigned_to?: number },
): Promise<Lead> {
  const response = await apiRequest<SuccessResponse<Lead>>(`/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function listActiveUsers(): Promise<PaginatedResponse<UserOption>> {
  return apiRequest('/users?is_active=true&limit=100');
}

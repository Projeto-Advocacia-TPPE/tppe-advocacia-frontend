import {
  apiRequest,
  PaginatedResponse,
  SuccessResponse,
} from './api';

export type ClientListItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
};

export type Client = ClientListItem & {
  address: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ClientCreate = {
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
  address: string | null;
};

export type ClientUpdate = Partial<ClientCreate>;

export type ClientNote = {
  id: number;
  client_id: number;
  created_by: number;
  updated_by: number | null;
  created_by_name: string;
  updated_by_name: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ProcessStatus = 'ATIVO' | 'SUSPENSO' | 'ARQUIVADO' | 'ENCERRADO';

export type ClientProcess = {
  id: number;
  number: string;
  action_type: string;
  court: string;
  status: ProcessStatus;
  created_at: string;
  last_movement: {
    id: number;
    title: string;
    occurred_at: string;
    source: 'MANUAL' | 'SYSTEM';
  } | null;
};

export type RecentActivity = {
  kind: 'movement' | 'client_note';
  process_id: number | null;
  note_id: number | null;
  title: string | null;
  content: string | null;
  occurred_at: string;
  actor_id: number | null;
  actor_name: string | null;
};

export type ClientTimeline = {
  client: Client;
  notes: ClientNote[];
  processes: ClientProcess[];
  recent_activity: RecentActivity[];
};

export async function listClients(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<ClientListItem>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.search) query.set('search', params.search);
  return apiRequest(`/clients?${query}`);
}

export async function createClient(payload: ClientCreate): Promise<Client> {
  const response = await apiRequest<SuccessResponse<Client>>('/clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateClient(clientId: number, payload: ClientUpdate): Promise<Client> {
  const response = await apiRequest<SuccessResponse<Client>>(`/clients/${clientId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function anonymizeClient(clientId: number): Promise<void> {
  await apiRequest(`/clients/${clientId}?confirm=true`, { method: 'DELETE' });
}

export async function getClientTimeline(clientId: number): Promise<ClientTimeline> {
  const response = await apiRequest<SuccessResponse<ClientTimeline>>(`/clients/${clientId}/timeline`);
  return response.data;
}

export async function createClientNote(clientId: number, content: string): Promise<ClientNote> {
  const response = await apiRequest<SuccessResponse<ClientNote>>(`/clients/${clientId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return response.data;
}

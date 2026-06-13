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

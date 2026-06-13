import {
  apiRequest,
  PaginatedResponse,
  SuccessResponse,
} from './api';

export type ProcessStatus = 'ATIVO' | 'SUSPENSO' | 'ARQUIVADO' | 'ENCERRADO';

export type ProcessListItem = {
  id: number;
  number: string;
  client_id: number | null;
  client_name: string | null;
  court: string;
  tribunal_alias: string | null;
  action_type: string;
  status: ProcessStatus;
  created_at: string;
};

export type ProcessDetail = ProcessListItem & {
  opposing_party: string | null;
  created_by: number | null;
  updated_by: number | null;
  updated_at: string;
};

export type ClientListItem = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
};

export type Movement = {
  id: number;
  process_id: number;
  title: string;
  description: string | null;
  occurred_at: string;
  source: 'MANUAL' | 'SYSTEM';
  external_id: string | null;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
};

export type ProcessCreate = {
  number: string;
  client_id: number | null;
  court: string;
  tribunal_alias: string | null;
  action_type: string;
  opposing_party: string | null;
};

export type DataJudSyncResult = {
  process_id: number;
  process_number: string;
  tribunal_alias: string;
  imported_count: number;
  skipped_count: number;
  external_api_log_id: number;
  synced_at: string;
  movements: Movement[];
};

export async function listProcesses(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProcessStatus | '';
} = {}): Promise<PaginatedResponse<ProcessListItem>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  return apiRequest(`/processes?${query}`);
}

export async function listClients(): Promise<PaginatedResponse<ClientListItem>> {
  return apiRequest('/clients?limit=100');
}

export async function createProcess(
  payload: ProcessCreate,
): Promise<ProcessDetail> {
  const response = await apiRequest<SuccessResponse<ProcessDetail>>('/processes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function getProcess(processId: number): Promise<ProcessDetail> {
  const response = await apiRequest<SuccessResponse<ProcessDetail>>(
    `/processes/${processId}`,
  );
  return response.data;
}

export async function listMovements(
  processId: number,
): Promise<PaginatedResponse<Movement>> {
  return apiRequest(`/processes/${processId}/movements?limit=100`);
}

export async function changeProcessStatus(
  processId: number,
  status: ProcessStatus,
): Promise<ProcessDetail> {
  const response = await apiRequest<SuccessResponse<ProcessDetail>>(
    `/processes/${processId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
  return response.data;
}

export async function syncProcessWithDataJud(
  processId: number,
): Promise<DataJudSyncResult> {
  const response = await apiRequest<SuccessResponse<DataJudSyncResult>>(
    `/processes/${processId}/sync`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  );
  return response.data;
}

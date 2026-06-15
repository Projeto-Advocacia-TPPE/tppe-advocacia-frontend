import { apiRequest, PaginatedResponse, SuccessResponse } from './api';

export type Deadline = {
  id: number;
  process_id: number;
  start_date: string;
  business_days: number;
  deadline_type: string;
  due_date: string;
  court: string | null;
  comarca: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type DeadlineWrite = {
  start_date: string;
  business_days: number;
  deadline_type: string;
  comarca: string | null;
};

export async function listProcessDeadlines(processId: number): Promise<PaginatedResponse<Deadline>> {
  return apiRequest(`/processes/${processId}/deadlines?limit=100`);
}

export async function createProcessDeadline(processId: number, payload: DeadlineWrite): Promise<Deadline> {
  const response = await apiRequest<SuccessResponse<Deadline>>(`/processes/${processId}/deadlines`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateDeadline(deadlineId: number, payload: DeadlineWrite): Promise<Deadline> {
  const response = await apiRequest<SuccessResponse<Deadline>>(`/deadlines/${deadlineId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteDeadline(deadlineId: number): Promise<void> {
  await apiRequest(`/deadlines/${deadlineId}`, { method: 'DELETE' });
}

export type DeadlineCalculateResult = {
  start_date: string;
  business_days: number;
  due_date: string;
  court: string | null;
  comarca: string | null;
  skipped_days: { date: string; reason: 'WEEKEND' | 'HOLIDAY'; description: string | null }[];
};

export async function calculateDeadline(params: {
  start_date: string;
  business_days: number;
  court?: string | null;
  comarca?: string | null;
}): Promise<DeadlineCalculateResult> {
  const response = await apiRequest<SuccessResponse<DeadlineCalculateResult>>('/deadlines/calculate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.data;
}

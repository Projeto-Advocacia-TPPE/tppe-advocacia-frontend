import { apiRequest, PaginatedResponse, SuccessResponse } from './api';

export type HolidayScope = 'NATIONAL' | 'COURT' | 'COMARCA';

export type ForensicHoliday = {
  id: number;
  date: string;
  description: string;
  scope: HolidayScope;
  court: string | null;
  comarca: string | null;
  created_at: string;
  updated_at: string;
};

export type HolidayCreate = {
  date: string;
  description: string;
  scope: HolidayScope;
  court?: string | null;
  comarca?: string | null;
};

export type HolidayUpdate = Partial<HolidayCreate>;

export async function listForensicHolidays(params?: {
  year?: number;
  court?: string;
  comarca?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ForensicHoliday>> {
  const q = new URLSearchParams();
  if (params?.year)    q.set('year', String(params.year));
  if (params?.court)   q.set('court', params.court);
  if (params?.comarca) q.set('comarca', params.comarca);
  if (params?.page)    q.set('page', String(params.page));
  if (params?.limit)   q.set('limit', String(params.limit));
  return apiRequest(`/forensic-holidays?${q}`);
}

export async function createForensicHoliday(payload: HolidayCreate): Promise<ForensicHoliday> {
  const res = await apiRequest<SuccessResponse<ForensicHoliday>>('/forensic-holidays', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateForensicHoliday(id: number, payload: HolidayUpdate): Promise<ForensicHoliday> {
  const res = await apiRequest<SuccessResponse<ForensicHoliday>>(`/forensic-holidays/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteForensicHoliday(id: number): Promise<void> {
  await apiRequest(`/forensic-holidays/${id}`, { method: 'DELETE' });
}

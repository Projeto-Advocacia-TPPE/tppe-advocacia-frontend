import { apiRequest, PaginatedResponse, SuccessResponse } from './api';

export type AppointmentType = 'AUDIENCIA' | 'REUNIAO' | 'PRAZO' | 'OUTRO';

export type Appointment = {
  id: number;
  title: string;
  type: AppointmentType;
  starts_at: string;
  duration_minutes: number;
  description: string | null;
  location: string | null;
  client_id: number | null;
  process_id: number | null;
  created_by: number;
  created_by_name: string;
  google_event_id: string | null;
  is_synced_to_google: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentWrite = {
  title: string;
  type: AppointmentType;
  starts_at: string;
  duration_minutes: number;
  client_id?: number | null;
  process_id?: number | null;
  description?: string | null;
  location?: string | null;
};

export async function listAppointments(params: {
  date_from?: string;
  date_to?: string;
  type?: AppointmentType;
  client_id?: number;
  process_id?: number;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<Appointment>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 200),
  });
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);
  if (params.type) query.set('type', params.type);
  if (params.client_id) query.set('client_id', String(params.client_id));
  if (params.process_id) query.set('process_id', String(params.process_id));
  return apiRequest(`/appointments?${query}`);
}

export async function createAppointment(payload: AppointmentWrite): Promise<Appointment> {
  const response = await apiRequest<SuccessResponse<Appointment>>('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateAppointment(id: number, payload: Partial<AppointmentWrite>): Promise<Appointment> {
  const response = await apiRequest<SuccessResponse<Appointment>>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteAppointment(id: number): Promise<void> {
  await apiRequest(`/appointments/${id}`, { method: 'DELETE' });
}

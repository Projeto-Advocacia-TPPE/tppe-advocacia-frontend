import { apiRequest, PaginatedResponse, SuccessResponse } from './api';

export type NotificationEventType =
  | 'PROCESS_MOVEMENT_CREATED'
  | 'PROCESS_STATUS_CHANGED'
  | 'LEAD_ASSIGNED'
  | 'TASK_ASSIGNED'
  | 'DEADLINE_APPROACHING'
  | 'DEADLINE_EXPIRED'
  | 'EXTERNAL_API_FAILURE';

export type NotificationPreferences = Record<NotificationEventType, boolean>;

export type ExternalApiLogStatus = 'SUCCESS' | 'FAILURE';

export type ExternalApiLog = {
  id: number;
  provider: string;
  operation: string;
  status: ExternalApiLogStatus;
  process_id: number | null;
  tribunal_alias: string | null;
  request_identifier: string | null;
  http_status: number | null;
  error_code: string | null;
  error_message: string | null;
  created_by: number | null;
  created_at: string;
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await apiRequest<SuccessResponse<{ preferences: NotificationPreferences }>>(
    '/notifications/preferences',
  );
  return response.data.preferences;
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const response = await apiRequest<SuccessResponse<{ preferences: NotificationPreferences }>>(
    '/notifications/preferences',
    {
      method: 'PATCH',
      body: JSON.stringify({ preferences: prefs }),
    },
  );
  return response.data.preferences;
}

export async function listExternalApiLogs(params: {
  status?: ExternalApiLogStatus;
  process_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<ExternalApiLog>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.status) query.set('status', params.status);
  if (params.process_id) query.set('process_id', String(params.process_id));
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);
  return apiRequest(`/external-api-logs?${query}`);
}

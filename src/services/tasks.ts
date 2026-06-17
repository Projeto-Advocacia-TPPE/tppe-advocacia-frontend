import { apiRequest, SuccessResponse } from './api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  order: number;
  assigned_to: number | null;
  assigned_to_name: string | null;
  client_id: number | null;
  process_id: number | null;
  created_by: number;
  created_by_name: string;
  updated_by: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type KanbanColumn = {
  items: Task[];
  total: number;
  has_more: boolean;
};

export type TaskKanban = Record<TaskStatus, KanbanColumn>;

export type TaskWrite = {
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status?: TaskStatus;
  assigned_to: number | null;
  client_id: number | null;
  process_id: number | null;
};

export type TaskListParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  client_id?: number;
  process_id?: number;
  page?: number;
  limit?: number;
};

export type PaginatedTasks = {
  data: Task[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function listTasks(params: TaskListParams = {}): Promise<PaginatedTasks> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.assigned_to) query.set('assigned_to', String(params.assigned_to));
  if (params.client_id) query.set('client_id', String(params.client_id));
  if (params.process_id) query.set('process_id', String(params.process_id));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const suffix = query.size ? `?${query}` : '';
  return apiRequest<PaginatedTasks>(`/tasks${suffix}`);
}

export async function getTaskKanban(params: {
  assignedTo?: number | '';
  clientId?: number | '';
  processId?: number | '';
} = {}): Promise<TaskKanban> {
  const query = new URLSearchParams();
  if (params.assignedTo) query.set('assigned_to', String(params.assignedTo));
  if (params.clientId) query.set('client_id', String(params.clientId));
  if (params.processId) query.set('process_id', String(params.processId));
  const suffix = query.size ? `?${query}` : '';
  const response = await apiRequest<SuccessResponse<TaskKanban>>(`/tasks/kanban${suffix}`);
  return response.data;
}

export async function createTask(payload: TaskWrite): Promise<Task> {
  const response = await apiRequest<SuccessResponse<Task>>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateTask(taskId: number, payload: TaskWrite): Promise<Task> {
  const response = await apiRequest<SuccessResponse<Task>>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function moveTask(taskId: number, status: TaskStatus, order: number): Promise<Task> {
  const response = await apiRequest<SuccessResponse<Task>>(`/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status, order }),
  });
  return response.data;
}

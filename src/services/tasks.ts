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

export async function getTaskKanban(): Promise<TaskKanban> {
  const response = await apiRequest<SuccessResponse<TaskKanban>>('/tasks/kanban');
  return response.data;
}

export async function moveTask(taskId: number, status: TaskStatus, order: number): Promise<Task> {
  const response = await apiRequest<SuccessResponse<Task>>(`/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status, order }),
  });
  return response.data;
}

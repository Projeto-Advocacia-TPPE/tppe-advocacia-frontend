const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'advocacia_access_token';

type ErrorBody = {
  error?: {
    code?: string;
    message?: unknown;
  };
  // FastAPI validation errors (422)
  detail?: unknown;
};

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PageMeta;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type SessionClaims = {
  sub: string;
  role: 'ADMIN' | 'USER';
  exp: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function parseMessage(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message && typeof message === 'object' && 'msg' in message) {
    return String((message as any).msg);
  }
  return 'Não foi possível concluir a solicitação.';
}

function parseErrorBody(status: number, body: ErrorBody): string {
  // Formato padrão do projeto: { error: { message } }
  if (body.error?.message) {
    return parseMessage(body.error.message);
  }

  // FastAPI validation error (422): { detail: [ { msg, loc, type } ] }
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    const first = body.detail[0] as any;
    const field = Array.isArray(first?.loc) ? first.loc.slice(-1)[0] : '';
    const msg   = first?.msg ?? 'Erro de validação';
    return field ? `Campo "${field}": ${msg}` : String(msg);
  }

  // FastAPI string detail
  if (typeof body.detail === 'string') {
    return body.detail;
  }

  const fallbacks: Record<number, string> = {
    400: 'Requisição inválida.',
    401: 'Não autorizado.',
    403: 'Sem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito — registro já existe.',
    422: 'Dados inválidos. Verifique os campos e tente novamente.',
    500: 'Erro interno do servidor.',
  };
  return fallbacks[status] ?? 'Não foi possível concluir a solicitação.';
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getSessionClaims(): SessionClaims | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as SessionClaims;
  } catch {
    clearAccessToken();
    return null;
  }
}

export function hasValidSession(): boolean {
  const claims = getSessionClaims();
  if (!claims) return false;
  if (claims.exp * 1000 <= Date.now()) {
    clearAccessToken();
    return false;
  }
  return true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { authenticated?: boolean } = {},
): Promise<T> {
  const { authenticated = true, headers, ...requestOptions } = options;
  const token = getAccessToken();

  const requestHeaders = new Headers(headers);
  if (requestOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (authenticated && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => ({}))) as ErrorBody;

  if (!response.ok) {
    throw new ApiError(
      parseErrorBody(response.status, body),
      response.status,
      body.error?.code,
    );
  }

  return body as T;
}
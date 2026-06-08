import {
  apiRequest,
  clearAccessToken,
  setAccessToken,
  SuccessResponse,
} from './api';

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function login(email: string, password: string): Promise<void> {
  const response = await apiRequest<SuccessResponse<TokenResponse>>('/auth/login', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(response.data.access_token);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest<SuccessResponse<null>>('/auth/password-reset/request', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify({ email }),
  });
}

export function logout(): void {
  clearAccessToken();
}

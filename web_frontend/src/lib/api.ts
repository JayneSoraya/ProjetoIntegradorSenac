export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:3333/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.erro ?? payload?.mensagem ?? 'Falha na comunicação com a API.';
    throw new ApiError(String(message), response.status);
  }

  return payload as T;
}

export type PortalRole = 'USUARIO' | 'SUPERMERCADO' | 'ADMIN';

export interface PortalUser {
  id_conta: number;
  id_usuario: number | null;
  nome: string;
  email: string;
  tipo_conta: PortalRole;
}

export async function getCurrentUser(): Promise<PortalUser> {
  const data = await apiFetch<{ usuario: PortalUser }>('/auth/me');
  return data.usuario;
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', { method: 'POST' });
}

/**
 * Client-Side API Service for FIR Analyzer Agentic AI
 */

import { AuthSession, FIRReport, SystemStatus, CompareCasesResult } from '../types/fir';

const TOKEN_STORAGE_KEY = 'fir_auth_bearer_token';

export function getStoredAuthToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage restriction
  }
}

export function removeStoredAuthToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function getRequestHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    removeStoredAuthToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fir-session-expired', {
          detail: 'Your officer session has expired or is invalid. Please sign in with authorized credentials.',
        })
      );
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new ApiError(
      res.ok
        ? 'Invalid response format received from server.'
        : `Server error (${res.status}): ${text.slice(0, 150)}`,
      res.status
    );
  }

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed with status ${res.status}`, res.status);
  }
  return data as T;
}

export const api = {
  async login(username: string, password: string): Promise<AuthSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const session = await handleResponse<AuthSession & { token?: string }>(res);
    if (session.token) {
      setStoredAuthToken(session.token);
    }
    return session;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getRequestHeaders(),
        credentials: 'include',
      });
    } finally {
      removeStoredAuthToken();
    }
  },

  async getSession(): Promise<AuthSession> {
    const res = await fetch('/api/auth/session', {
      headers: getRequestHeaders(),
      credentials: 'include',
    });
    return handleResponse<AuthSession>(res);
  },

  async analyzeComplaint(params: {
    complaintText: string;
    complaintTitle?: string;
    incidentLocation?: string;
    incidentDateTime?: string;
  }): Promise<FIRReport> {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(params),
    });
    return handleResponse<FIRReport>(res);
  },

  async compareCases(caseAText: string, caseBText: string): Promise<CompareCasesResult> {
    const res = await fetch('/api/compare-cases', {
      method: 'POST',
      headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ caseAText, caseBText }),
    });
    return handleResponse<CompareCasesResult>(res);
  },

  async getReports(): Promise<FIRReport[]> {
    const res = await fetch('/api/reports', {
      headers: getRequestHeaders(),
      credentials: 'include',
    });
    return handleResponse<FIRReport[]>(res);
  },

  async getReportById(id: string): Promise<FIRReport> {
    const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
      headers: getRequestHeaders(),
      credentials: 'include',
    });
    return handleResponse<FIRReport>(res);
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/status', {
      headers: getRequestHeaders(),
      credentials: 'include',
    });
    return handleResponse<SystemStatus>(res);
  },
};

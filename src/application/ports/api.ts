export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
}

export interface ServerEntity {
  id: string;
  [key: string]: unknown;
}

export interface ResourceGateway {
  list<T>(path: string): Promise<T[]>;
  create<T>(path: string, value: unknown): Promise<T>;
  update<T>(path: string, id: string, value: unknown): Promise<T>;
  remove(path: string, id: string): Promise<void>;
}

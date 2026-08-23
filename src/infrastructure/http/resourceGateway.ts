import { api } from "@/infrastructure/http/apiClient";
import type { ResourceGateway, ServerEntity } from "@/application/ports/api";

export const resources: ResourceGateway = {
  list: <T>(path: string) => api.get<T[]>(`/api/v1/${path}`),
  create: <T>(path: string, value: unknown) => api.post<T>(`/api/v1/${path}`, value),
  update: <T>(path: string, id: string, value: unknown) => api.put<T>(`/api/v1/${path}/${id}`, value),
  remove: (path: string, id: string) => api.delete(`/api/v1/${path}/${id}`),
};

export const documentsApi = {
  upload(file: File, name?: string, categoryName?: string) {
    const body = new FormData(); body.append("file", file); if (name) body.append("name", name); if (categoryName) body.append("categoryName", categoryName);
    return api.post<ServerEntity>("/api/v1/documents", body);
  },
  signedUrl(id: string) { return api.get<{ url: string }>(`/api/v1/documents/${id}/signed-url`); },
  rename(id: string, name: string, categoryName?: string, tags: string[] = []) { return api.patch(`/api/v1/documents/${id}`, { name, categoryName, tags }); },
  remove(id: string) { return api.delete(`/api/v1/documents/${id}`); },
};

import axios, { type AxiosInstance } from "axios";

import { apiConfig } from "./config";
import { createJobsModule } from "./modules/jobs";

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export function createApiClient(config: ApiConfig) {
  const client: AxiosInstance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { error?: string; message?: string }
          | undefined;
        const message =
          data?.error ?? data?.message ?? error.message ?? "Unexpected error.";
        return Promise.reject(new Error(message));
      }
      return Promise.reject(error);
    },
  );

  return {
    jobs: createJobsModule(client),
  };
}

export const api = createApiClient(apiConfig);

export type ApiClient = ReturnType<typeof createApiClient>;

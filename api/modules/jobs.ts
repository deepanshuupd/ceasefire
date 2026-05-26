import type { AxiosInstance, AxiosResponse } from "axios";

export interface CreateJobPayload {
  youtubeUrl: string;
}

export function createJobsModule(client: AxiosInstance) {
  return {
    create: (payload: CreateJobPayload): Promise<AxiosResponse> =>
      client.post("/api/jobs", payload),
  };
}

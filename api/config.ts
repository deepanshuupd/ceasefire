import type { ApiConfig } from "./index";

export const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 10_000),
};

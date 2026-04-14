const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = {
  jobs: {
    create: () => `${BASE}/api/jobs`,
  },
};

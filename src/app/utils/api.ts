// Base URL for the backend API
// In development, Vite proxy forwards /api/* to localhost:5000
// In production, set VITE_API_URL to the backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Helper for making fetch requests to the backend with credentials (cookies).
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // always send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
}

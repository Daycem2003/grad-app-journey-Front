// API base configuration
const API_BASE_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:8000/api/v1";

export const getHeaders = (token?: string, onboardingToken?: string, includeAuth = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const effectiveToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

    if (effectiveToken) {
      headers["Authorization"] = `Bearer ${effectiveToken}`;
    }
  }

  if (onboardingToken) {
    headers["X-Onboarding-Token"] = onboardingToken;
  }

  return headers;
};

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      // Si une route protégée renvoie 401 (token expiré ou révoqué), on nettoie les tokens résiduels
      if (!response.url.includes("/auth/login") && !response.url.includes("/auth/register")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }

    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    try {
      const error = await response.json();
      errorMessage =
        error.detail ||
        error.message ||
        error.error ||
        JSON.stringify(error);
    } catch {
      // La réponse n'est pas du JSON
    }

    throw new Error(errorMessage);
  }

  return response;
};

export { API_BASE_URL };
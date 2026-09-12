// API base configuration
const API_BASE_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:8000/api/v1";

export const getHeaders = (token?: string, onboardingToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

 
  if (onboardingToken) {
    headers["X-Onboarding-Token"] = onboardingToken;
  }

  return headers;
};

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
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
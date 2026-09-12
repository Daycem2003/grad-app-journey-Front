import { API_BASE_URL, getHeaders, handleApiError } from "./api";

export type UserRole = "CANDIDATE" | "COORDINATOR" | "ADMIN";

export interface User {
  id: number;
  pubkey: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ActivateAccountRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface MessageResponse {
  message: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });

    await handleApiError(response);
    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    await handleApiError(response);
    return response.json();
  }

  async activateAccount(data: ActivateAccountRequest): Promise<MessageResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/activate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    await handleApiError(response);
    return response.json();
  }

  async getMe(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(token),
    });

    await handleApiError(response);
    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    await handleApiError(response);
    return response.json();
  }

  async logout(): Promise<void> {
    // Clear local storage on logout
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  getStoredToken(): string | null {
    return localStorage.getItem("access_token");
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  saveUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();

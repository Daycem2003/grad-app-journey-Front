import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type User, type UserRole } from "@/services/auth-service";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getStoredToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setAccessToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      authService.saveTokens(response.access_token, response.refresh_token);
      authService.saveUser(response.user);
      setUser(response.user);
      setAccessToken(response.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ email, password, confirmPassword });
      authService.saveTokens(response.access_token, response.refresh_token);
      authService.saveUser(response.user);
      setUser(response.user);
      setAccessToken(response.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token");

      const response = await authService.refreshToken(refreshToken);
      authService.saveTokens(response.access_token, response.refresh_token);
      authService.saveUser(response.user);
      setUser(response.user);
      setAccessToken(response.access_token);
    } catch (error) {
      // If refresh fails, logout
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    role: user?.role || null,
    accessToken,
    login,
    logout,
    register,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

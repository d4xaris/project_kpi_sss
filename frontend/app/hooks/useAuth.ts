import { useState, useEffect } from "react";
import { apiFetch, configureProxy } from "~/hooks/authProxy";

interface User {
  id: number;
  nickname: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure the auth proxy once on mount
    configureProxy({
      strategy:      'jwt',
      rateLimitRpm:  60,
      enableLogging: true,
      onTokenExpired: () => setUser(null),
    });

    // Анкомент - то для бета тесту акк
    //setUser({ id: 1, nickname: "TestUser67" });
    //setIsLoading(false);

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (login: string, nickname: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/registration", {
        method: "POST",
        body: JSON.stringify({ login, nickname, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}

// Re-export proxy utilities so callers only need one import
export { apiFetch, configureProxy, withStrategy, getRequestLog } from "~/hooks/authProxy";
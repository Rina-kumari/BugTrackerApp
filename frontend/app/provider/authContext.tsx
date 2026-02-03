import type { User } from "@/types/indexTypes";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./reactQueryProvider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib/indexUtils";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void; // ← Added this function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const isPublicRoute = publicRoutes.includes(currentPath);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          if (!isPublicRoute) {
            navigate("/sign-in", { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        setIsAuthenticated(false);
        if (!isPublicRoute) {
          navigate("/sign-in", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, isPublicRoute]);

  const login = async (data: any) => {
    try {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset auth state
      setUser(null);
      setIsAuthenticated(false);

      // Clear React Query cache
      queryClient.clear();

      // Navigate to sign-in page
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if there's an error, still try to clear state and navigate
      setUser(null);
      setIsAuthenticated(false);
      navigate("/sign-in", { replace: true });
    }
  };

  // ← New function to update user data
  const updateUser = (userData: User) => {
    try {
      // Update state
      setUser(userData);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const values = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser, // ← Export the new function
  };

  return (
    <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
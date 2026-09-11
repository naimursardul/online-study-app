import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { client, setUnauthorizedHandler } from "../utils/utils";
import type { IPopulatedData } from "@/types/types";

// 👉 Define your user type
interface IAuthUser {
  _id?: string;
  name: string;
  phone: string;
  img: string;
  role: "admin" | "user" | "super-admin";
  userCategory: "regular" | "premium";
  level: IPopulatedData;
  background: IPopulatedData;
}

// 👉 Context type
type AuthContextType = {
  user: IAuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<IAuthUser | null>>;
  authLoader: boolean;
  userExisted: boolean;
};

// 👉 Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👉 Provider props
type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [authLoader, setAuthLoader] = useState(true);

  const userExisted = localStorage.getItem("userExisted") === "true";

  // ✅ CHECK AUTH
  const checkAuth = async () => {
    try {
      const res = await client.get("/auth/check-auth");

      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("userExisted", "true");
      } else {
        setUser(null);
        localStorage.removeItem("userExisted");
      }
    } catch (error) {
      // Only a real 401 means "no session". A network failure or a 5xx (the
      // API cold-starting on Render) must NOT log the user out: leave the
      // cached identity alone and let the next request decide.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("userExisted");
      }
    } finally {
      setAuthLoader(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // The axios interceptor's 401 hook: any request outside the auth endpoints
  // failing with 401 clears the session once, here, instead of each call site
  // raising its own local toast.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      localStorage.removeItem("userExisted");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoader,
        userExisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook (FIXED)

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };

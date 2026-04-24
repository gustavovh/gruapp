import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "@gruaya/auth-user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle?: {
    plate: string;
    model: string;
    color: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setUser(JSON.parse(raw) as AuthUser);
        }
      } catch (err) {
        console.warn("Auth load failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: AuthUser | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, _password: string): Promise<AuthUser> => {
      await new Promise((r) => setTimeout(r, 600));
      const next: AuthUser = {
        id: makeId(),
        name: email.split("@")[0]?.replace(/[._-]/g, " ") || "Usuario",
        email,
        phone: "",
      };
      await persist(next);
      return next;
    },
    [persist],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<AuthUser> => {
      await new Promise((r) => setTimeout(r, 800));
      const next: AuthUser = {
        id: makeId(),
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
      await persist(next);
      return next;
    },
    [persist],
  );

  const logout = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const updateUser = useCallback(
    async (patch: Partial<AuthUser>) => {
      if (!user) return;
      const next = { ...user, ...patch };
      await persist(next);
    },
    [user, persist],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, updateUser }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

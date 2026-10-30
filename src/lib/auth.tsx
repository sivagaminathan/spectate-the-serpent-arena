import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "./api";

interface AuthCtx {
  user: User | null;
  login: (u: string, p: string) => Promise<void>;
  signup: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    api.getCurrentUser().then(setUser);
  }, []);
  return (
    <Ctx.Provider
      value={{
        user,
        login: async (u, p) => setUser(await api.login(u, p)),
        signup: async (u, p) => setUser(await api.signup(u, p)),
        logout: async () => {
          await api.logout();
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}

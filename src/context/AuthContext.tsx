import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

type AuthContextType = {
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function cleanUsername(username: string) {
  return username.trim().toLowerCase();
}

function getEmail(username: string) {
  const encoded = [...new TextEncoder().encode(username)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `${encoded}@users.chat.invalid`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user.user_metadata.username ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user.user_metadata.username ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function register(usernameInput: string, password: string) {
    const username = cleanUsername(usernameInput);

    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters.");
    }

    if (new TextEncoder().encode(username).length > 32) {
      throw new Error("Username must be at most 32 bytes.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: getEmail(username),
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw new Error(
        error.code === "user_already_exists"
          ? "Username already exists."
          : error.message
      );
    }

    if (!data.session) {
      throw new Error(
        "Disable email confirmation in Supabase to use username registration."
      );
    }

    setUser(username);
  }

  async function login(usernameInput: string, password: string) {
    const username = cleanUsername(usernameInput);

    const { error } = await supabase.auth.signInWithPassword({
      email: getEmail(username),
      password,
    });

    if (error) {
      throw new Error(
        error.code === "invalid_credentials"
          ? "Invalid username or password."
          : error.message
      );
    }

    setUser(username);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not log out:", error.message);
      return;
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { AuthMethod, AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoginOpen: boolean;

  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  sendMagicLink: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;

  signInWithGoogle: (
    returnTo?: string
  ) => Promise<{ success: boolean; error?: string }>;

  sendEmailOtp: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;

  verifyEmailOtp: (
    email: string,
    token: string
  ) => Promise<{ success: boolean; error?: string }>;

  logout: () => Promise<void>;

  openLogin: () => void;
  closeLogin: () => void;

  requireAuth: (onReady: () => void) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<(() => void) | null>(null);

  const convertUser = useCallback(
    (supabaseUser: {
      id: string;
      email?: string;
      app_metadata?: { provider?: string };
    }): AuthUser | null => {
      if (!supabaseUser.email) return null;

      const provider = supabaseUser.app_metadata?.provider;

      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        method: provider === "google" ? "google" : "password",
      };
    },
    []
  );

  const loadUser = useCallback(async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      setUser(convertUser(supabaseUser));
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [convertUser, supabase]);

  useEffect(() => {
    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(convertUser(session.user));
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [convertUser, loadUser, supabase]);

  const completeLogin = useCallback(
    (method: AuthMethod) => {
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              method,
            }
          : null
      );

      setIsLoginOpen(false);

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    [pendingAction]
  );

  const loginWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message ?? "Unable to sign in.",
      };
    }

    setUser({
      id: data.user.id,
      email: data.user.email ?? email,
      method: "password",
    });

    completeLogin("password");

    return { success: true };
  };

  const signUpWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.user && data.session) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? email,
        method: "password",
      });

      completeLogin("password");
    }

    return { success: true };
  };

  const sendMagicLink = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  };

  const signInWithGoogle = async (returnTo?: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const currentPath =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    const targetPath = returnTo || currentPath;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // The browser is redirected to Google here, so there's nothing
    // more to do on this side — completeLogin() runs after the
    // redirect back through /auth/callback, via onAuthStateChange.
    return { success: true };
  };

  const sendEmailOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  };

  const verifyEmailOtp = async (
    email: string,
    token: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message ?? "Invalid or expired OTP.",
      };
    }

    setUser({
      id: data.user.id,
      email: data.user.email ?? email,
      method: "email_otp",
    });

    completeLogin("email_otp");

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (onReady: () => void) => {
    if (user) {
      onReady();
      return true;
    }

    setPendingAction(() => onReady);
    setIsLoginOpen(true);

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoginOpen,
        loginWithPassword,
        signUpWithPassword,
        sendMagicLink,
        signInWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        logout,
        openLogin,
        closeLogin,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
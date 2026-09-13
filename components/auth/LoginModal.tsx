"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.5-5.5C29.6 34.7 27 35.6 24 35.6c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.9 39.7 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.8 35.9 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export default function LoginModal() {
  const { isLoginOpen, closeLogin, signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL query parameters for auth error redirected back from callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth_error")) {
        setError("Google authentication was cancelled or could not be completed. Please try again.");
      }
    }
  }, [isLoginOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isLoginOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogin();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginOpen, closeLogin]);

  if (!isLoginOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError("");

    const result = await signInWithGoogle();

    if (!result.success) {
      setIsSubmitting(false);
      const rawError = result.error ?? "Unable to connect to Google.";
      if (rawError.toLowerCase().includes("provider is not enabled")) {
        setError(
          "Google Auth is not enabled in your Supabase project yet. Please enable the Google provider in Supabase Dashboard -> Authentication -> Providers."
        );
      } else {
        setError(rawError);
      }
    }
    // On success, Supabase redirects the browser to Google consent screen
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLogin();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#262626] bg-[#111] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Subtle accent glow in background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-accent/15 blur-[60px]"
          />

          {/* Close button */}
          <button
            type="button"
            onClick={closeLogin}
            aria-label="Close dialog"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="relative mb-5">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
              <Sparkles size={11} />
              <span>Sign In &amp; Sign Up</span>
            </div>

            <h2
              id="login-title"
              className="mb-1.5 font-display text-2xl tracking-[0.02em] text-white"
            >
              Welcome to YOU KNOW ME
            </h2>

            <p className="text-xs leading-[1.6] text-[#999]">
              Sign in or create your account in one click with Google to track orders, save items, and speed up checkout.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="relative mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white py-3.5 px-4 text-sm font-semibold text-[#111] shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f3f3f3] hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 text-sm text-[#444]">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#888] border-t-accent" />
                  <span>Redirecting to Google...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="tracking-[0.01em]">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="relative mb-5 space-y-2 rounded-xl border border-[#1f1f1f] bg-[#161616]/70 p-3.5 text-left text-xs text-[#aaa]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold text-white">Instant 1-Click Access:</strong> Existing users sign in; new users are automatically registered.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold text-white">No Passwords:</strong> Safe and protected via official Google OAuth encryption.
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs leading-[1.5] text-red-300"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
              <div>{error}</div>
            </motion.div>
          )}

          {/* Footer note */}
          <p className="relative text-center text-[11px] leading-[1.5] text-[#666]">
            By continuing, you agree to YOU KNOW ME Terms of Service &amp; Privacy Policy.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
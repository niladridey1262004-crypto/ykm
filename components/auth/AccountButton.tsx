"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AccountDrawer from "@/components/auth/AccountDrawer";

/**
 * Drop into the Navbar (desktop and/or mobile controls row):
 *   import AccountButton from "@/components/auth/AccountButton";
 *   <AccountButton />
 */
export default function AccountButton() {
  const { user, openLogin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => (user ? setDrawerOpen(true) : openLogin())}
        aria-label={user ? "My account" : "Sign in"}
        className="flex h-[34px] w-[34px] sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all duration-200 hover:border-accent hover:text-accent hover:bg-white/5 active:scale-95 shrink-0"
      >
        <User size={15} />
      </button>
      <AccountDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

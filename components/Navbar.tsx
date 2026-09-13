"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { NAV_EMAIL } from "@/lib/content";
import AccountButton from "@/components/auth/AccountButton";

interface NavbarProps {
  isSubpage?: boolean;
}

export default function Navbar({ isSubpage = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { totalQty, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => {
      // Trigger scrolled state when scrolling past the hero title
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pillStyle =
    "inline-flex items-center justify-center rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-accent hover:text-accent hover:bg-white/5 active:scale-95 sm:px-5 sm:py-2 sm:text-sm shrink-0";

  return (
    <nav
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        scrolled || isSubpage
          ? "border-b border-white/10 bg-[#0a0a0a]/90 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent py-2"
      }`}
    >
      <div className="w-full px-3 sm:px-6 md:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left pill: Home */}
          <Link href="/" className={pillStyle}>
            Home
          </Link>

          {/* Middle-left pill: Info */}
          <a href="/#info" className={pillStyle}>
            Info
          </a>

          {/* Middle-right pill: Shop */}
          <a href="/#shop" className={pillStyle}>
            Shop
          </a>

          {/* Right pills: Contact + Account + Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <a href={`mailto:${NAV_EMAIL}`} className={pillStyle}>
              Contact
            </a>

            <AccountButton />

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open shopping cart with ${totalQty} items`}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent px-3 py-1.5 text-xs font-bold text-black shadow-md shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 active:scale-95 sm:px-4 sm:py-2 shrink-0"
            >
              <ShoppingCart size={14} />
              <span className="hidden xs:inline sm:inline">Cart</span>
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black text-[10px] font-bold text-accent">
                {totalQty}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

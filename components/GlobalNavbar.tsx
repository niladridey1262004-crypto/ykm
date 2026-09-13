"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

/**
 * Renders Navbar on subpages (like /shop/[id]).
 * On the home page ("/"), Navbar is rendered inside Hero at the exact
 * bottom of the name "YOU KNOW ME" to match the layout in Image 2.
 */
export default function GlobalNavbar() {
  const pathname = usePathname();

  if (pathname === "/") return null;
  if (pathname?.startsWith("/admin")) return null;

  return <Navbar isSubpage />;
}

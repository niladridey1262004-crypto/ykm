import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect back from Supabase after Google OAuth or a
// magic-link click. Supabase sends a `code` query param; we exchange
// it for a session and set the auth cookies, then send the user back
// to the page they started on (or the homepage).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Use the forwarded host when behind reverse proxies (like Vercel production)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const redirectOrigin = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  // Sanitize next to prevent open redirects
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}${safeNext}`);
    }

    console.error("Auth callback failed:", error.message);
  }

  return NextResponse.redirect(`${redirectOrigin}/?auth_error=1`);
}

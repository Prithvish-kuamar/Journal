import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { safeReturnPath } from "@/lib/supabase/auth-utils";

const publicPaths = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  // getSession reads the JWT from the cookie without a network round-trip.
  // requireUser() calls getUser() (network-verified) on every actual page/API handler.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const pathname = request.nextUrl.pathname;
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/_next/") || pathname.startsWith("/favicon");
  if (isPublic) return response;
  if (!user) {
    if (pathname.startsWith("/api/")) return new NextResponse("Unauthorized", { status: 401 });
    const login = new URL("/login", request.url);
    login.searchParams.set("next", safeReturnPath(`${pathname}${request.nextUrl.search}`));
    return NextResponse.redirect(login);
  }
  // Any authenticated account may proceed. Which rows they can see is decided
  // per-query by the ownerId scope, not here.
  return response;
}

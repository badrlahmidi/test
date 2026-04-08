import { type NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { locales, defaultLocale, type Locale } from "@/i18n";

const { auth } = NextAuth(authConfig);

/**
 * Detect the preferred locale from:
 *  1. The `NEXT_LOCALE` cookie (user's explicit preference)
 *  2. The `Accept-Language` request header
 *  3. Fall back to the default locale (`fr`)
 */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value as Locale | undefined;
  if (cookie && locales.includes(cookie)) return cookie;

  const acceptLang = request.headers.get("Accept-Language") ?? "";
  for (const locale of locales) {
    if (acceptLang.toLowerCase().includes(locale)) return locale;
  }
  return defaultLocale;
}

export default auth((request) => {
  const locale = detectLocale(request);

  // Persist the resolved locale so layout.tsx can read it without
  // needing a dynamic URL segment.
  const response = NextResponse.next();
  if (request.cookies.get("NEXT_LOCALE")?.value !== locale) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: false, // readable by client JS for language switcher
    });
  }
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/portal|p/).*)"],
};

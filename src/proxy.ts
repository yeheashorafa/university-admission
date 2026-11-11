import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { isPaymentRoute, paymentsEnabled } from "./constants/features";
import { routing } from "./i18n/routing";

const localize = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (!paymentsEnabled) {
    const path = request.nextUrl.pathname;
    const locale = routing.locales.find((value) => path.startsWith(`/${value}/`));
    if (isPaymentRoute(locale ? path.slice(locale.length + 1) : path)) {
      const unavailable = request.nextUrl.clone();
      unavailable.pathname = `/${locale ?? routing.defaultLocale}/__payment-unavailable`;
      unavailable.search = "";
      return NextResponse.rewrite(unavailable, { status: 404 });
    }
  }

  return localize(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};

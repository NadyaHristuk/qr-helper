import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Все пути, кроме api, служебных файлов Next.js и статики (файлы с точкой)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ua", "ru"],
  defaultLocale: "ua",
  localePrefix: "always",
});

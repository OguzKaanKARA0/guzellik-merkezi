import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  // Use absolute @/ alias to avoid relative path resolution issues with Turbopack
  const messages =
    locale === "en"
      ? (await import("@/messages/en.json")).default
      : (await import("@/messages/tr.json")).default;

  return {
    locale,
    messages,
    timeZone: "Europe/Istanbul"
  };
});

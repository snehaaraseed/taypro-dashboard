import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { loadMessages } from "./load-messages";
import { routing } from "./routing";

// NOTE: This config must NOT read dynamic request APIs (headers/cookies).
// Doing so opts every server component into dynamic rendering, which is what
// previously made all marketing HTML uncacheable (Cf-Cache-Status: DYNAMIC).
// Loading the full per-locale catalog keeps pages statically renderable/ISR.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Kolkata",
  };
});

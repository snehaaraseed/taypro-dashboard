import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { loadMessagesForPath } from "./load-messages";
import { pathnameWithoutLocale } from "./pathname-without-locale";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const headerList = await headers();
  const logicalPath =
    headerList.get("x-logical-pathname")?.trim() ||
    pathnameWithoutLocale(headerList.get("x-pathname")?.trim() || "") ||
    undefined;

  return {
    locale,
    messages: await loadMessagesForPath(locale, logicalPath),
    timeZone: "Asia/Kolkata",
  };
});

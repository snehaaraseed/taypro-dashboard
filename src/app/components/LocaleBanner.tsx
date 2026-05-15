"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function LocaleBanner() {
  const t = useTranslations("LocaleBanner");
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="border-b border-[#A8C117]/40 bg-[#0c2f42] px-4 py-2.5 text-center text-sm text-white/90"
    >
      <p>
        <strong className="text-[#A8C117]">{t("title")}</strong>
        {" — "}
        {t("body")}{" "}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-2 underline underline-offset-2 hover:text-[#A8C117]"
        >
          {t("dismiss")}
        </button>
      </p>
    </div>
  );
}

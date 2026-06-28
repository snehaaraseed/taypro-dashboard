"use client";

import { Facebook, Instagram, Linkedin, Youtube, X } from "lucide-react";
import { useEffect, useState } from "react";
import TrackedLink from "@/app/components/TrackedLink";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { ContactPhoneLink } from "@/app/components/ContactPhoneLink";
import { trackOutboundClick } from "@/lib/analytics/track-event";
import { usePathname } from "@/i18n/navigation";

export type FooterLink = {
  name: string;
  href: string;
};

type FooterTrackedLinksProps = {
  mailLabel: string;
  phoneLabel: string;
  emailLinkText: string;
  importantLinks: FooterLink[];
  exploreProducts: FooterLink[];
  copyright: string;
};

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/taypro.official",
    platform: "facebook" as const,
    label: "Taypro on Facebook",
    Icon: Facebook,
  },
  {
    href: "https://x.com/taypro_official",
    platform: "x" as const,
    label: "Taypro on X",
    Icon: X,
  },
  {
    href: "https://www.instagram.com/taypro_official/",
    platform: "instagram" as const,
    label: "Taypro on Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/company/taypro",
    platform: "linkedin" as const,
    label: "Taypro on LinkedIn",
    Icon: Linkedin,
  },
  {
    href: "https://www.youtube.com/c/taypro",
    platform: "youtube" as const,
    label: "Taypro on YouTube",
    Icon: Youtube,
  },
];

export default function FooterTrackedLinks({
  mailLabel,
  phoneLabel,
  emailLinkText,
  importantLinks,
  exploreProducts,
  copyright,
}: FooterTrackedLinksProps) {
  const pathnameHook = usePathname();
  const [pathname, setPathname] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPathname(pathnameHook);
  }, [pathnameHook]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-12 sm:px-12 lg:px-20 py-4 border-[#17405c]">
        <div className="flex flex-col md:flex-row justify-between w-full gap-20">
          <div className="md:w-1/2">
            <div className="flex flex-col sm:flex-row items-start gap-4 text-white text-2xl">
              <span>
                {mailLabel}:{" "}
                <ContactEmailLink className="hover:text-[#A8C117]" location="footer">
                  {emailLinkText}
                </ContactEmailLink>
              </span>
              <span className="hidden sm:block mx-2"></span>
              <span>
                {phoneLabel}:{" "}
                <ContactPhoneLink location="footer" className="hover:text-[#A8C117]" />
              </span>
            </div>
          </div>
          <div className="flex justify-between md:w-1/3">
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, platform, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  onClick={() =>
                    trackOutboundClick({
                      url: href,
                      platform,
                      location: "footer",
                    })
                  }
                >
                  <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
                    <Icon className="text-[#052638] w-6 h-6" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 sm:px-12 lg:px-20 py-10 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14 mb-8">
          <div className="lg:w-[320px] lg:shrink-0">
            <div className="text-lg text-white mb-4 whitespace-nowrap">Explore</div>
            <div className="space-y-5">
              {exploreProducts.map((item) => {
                const active = mounted && pathname === item.href;
                return (
                  <div className="group cursor-pointer" key={item.name}>
                    <hr
                      className={`border-white mb-4 transition-colors duration-300 ${
                        active
                          ? "border-[#A8C117]"
                          : "group-hover:border-[#A8C117]"
                      }`}
                    />
                    <TrackedLink
                      href={item.href}
                      trackTitle={item.name}
                      trackLocation="footer"
                      trackType="product"
                      className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                        active
                          ? "text-[#A8C117]"
                          : "text-white group-hover:text-[#A8C117]"
                      }`}
                    >
                      {item.name}
                    </TrackedLink>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-lg text-white mb-4 whitespace-nowrap">
              Important Links
            </div>
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-2">
              {importantLinks.map((link) => {
                const active = mounted && pathname === link.href;
                return (
                  <li key={link.name} className="relative min-w-0">
                    <TrackedLink
                      href={link.href}
                      trackTitle={link.name}
                      trackLocation="footer"
                      className={`transition duration-200 relative inline-block group text-sm leading-snug lg:whitespace-nowrap ${
                        active
                          ? "text-[#A8C117]"
                          : "text-gray-300 hover:text-[#A8C117]"
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute left-0 bottom-0 h-0.5 bg-[#A8C117] transition-all duration-300 ease-out origin-left ${
                          active ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      ></span>
                    </TrackedLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg">{copyright}</p>
          </div>
        </div>
      </div>
    </>
  );
}

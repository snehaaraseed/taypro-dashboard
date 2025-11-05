import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Taypro - Solar Panel Cleaning Robots",
  description:
    "Learn about how Taypro uses cookies and similar technologies on our website. Understand what cookies we use, why we use them, and how you can manage your cookie preferences.",
  keywords:
    "cookie policy, cookies, tracking, privacy, taypro, data protection, GDPR",
  openGraph: {
    title: "Cookie Policy | Taypro",
    description:
      "Learn about how Taypro uses cookies and similar technologies on our website.",
    type: "website",
  },
};

export default function CookiePolicyPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Cookie Policy", href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <section className="w-full bg-white py-15">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-[#0c2f42] text-center font-semibold text-7xl mb-20">
              Cookie Policy
            </h1>

            <div className="mt-8">
              <h2 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                Cookie Policy
              </h2>
              <div className="text-[#0c2f42] text-lg mb-8 font-normal">
                Last Updated: {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-[#0c2f42] text-lg font-normal leading-9">
                This Cookie Policy explains how Taypro ("we," "our," "us") uses
                cookies and similar tracking technologies on our website
                (taypro.in). This policy should be read alongside our{" "}
                <a
                  href="/privacy-policy"
                  className="text-[#A8C117] hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </div>
              <hr className="border border-gray-300 mt-8" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              1. What Are Cookies?
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Cookies are small text files that are placed on your device (computer,
              tablet, or mobile) when you visit a website. They are widely used to
              make websites work more efficiently and provide information to website
              owners.
            </div>
            <div className="text-[#0c2f42] text-lg mb-5">
              We also use similar technologies such as web beacons, pixel tags, and
              local storage, which function similarly to cookies.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              2. Types of Cookies We Use
            </h3>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                a. Necessary Cookies (Always Active)
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                These cookies are essential for the website to function properly.
                They enable core functionality such as security, network management,
                and accessibility. You cannot opt-out of these cookies.
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42]">
                <li>
                  <strong>admin-auth:</strong> Session cookie for admin
                  authentication (httpOnly, secure)
                </li>
                <li>
                  <strong>cookie-consent:</strong> Stores your cookie consent
                  preferences
                </li>
              </ul>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                b. Analytics Cookies (Optional)
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                These cookies help us understand how visitors interact with our
                website by collecting and reporting information anonymously. This
                helps us improve the website's functionality and user experience.
              </div>
              <div className="text-[#0c2f42] text-lg mb-4">
                <strong>Currently:</strong> We do not use analytics cookies at this
                time, but the option is available for future implementation. If we
                add analytics cookies in the future, we will update this policy and
                require your consent before activation.
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                c. Marketing Cookies (Optional)
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                These cookies are used to track visitors across websites for the
                purpose of displaying advertisements that are relevant and engaging.
              </div>
              <div className="text-[#0c2f42] text-lg mb-4">
                <strong>Currently:</strong> We do not use marketing cookies. If we
                implement marketing cookies in the future, we will update this policy
                and require your explicit consent.
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                d. Third-Party Cookies
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                Some third-party services we use may set their own cookies:
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42]">
                <li>
                  <strong>YouTube:</strong> When you interact with embedded YouTube
                  videos, YouTube may set cookies for functionality and analytics.
                  These are controlled by YouTube's privacy policy.
                </li>
                <li>
                  <strong>Google Maps:</strong> When you view embedded Google Maps,
                  Google may set cookies. These are controlled by Google's privacy
                  policy.
                </li>
                <li>
                  <strong>Google Fonts:</strong> May set cookies for font loading
                  optimization.
                </li>
              </ul>
              <div className="text-[#0c2f42] text-lg mt-4">
                <strong>Note:</strong> We use YouTube embeds and Google Maps with
                privacy-enhanced mode where possible. These third-party services only
                load after you provide consent.
              </div>
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              3. How We Use Cookies
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We use cookies for the following purposes:
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>To enable essential website functionality</li>
              <li>To remember your cookie preferences</li>
              <li>To maintain admin session security</li>
              <li>
                To improve website performance and user experience (if analytics
                cookies are enabled)
              </li>
            </ul>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              4. Managing Your Cookie Preferences
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              You have control over your cookie preferences:
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                Use our cookie consent banner to accept or reject non-essential
                cookies
              </li>
              <li>
                Click the cookie icon (bottom-right) to change your preferences at
                any time
              </li>
              <li>
                Most web browsers allow you to control cookies through their settings
                preferences. However, limiting cookies may impact your experience on
                our website
              </li>
            </ul>
            <div className="bg-gray-50 p-6 rounded-lg mt-6">
              <h4 className="text-[#0c2f42] font-semibold text-xl mb-3">
                Browser Settings
              </h4>
              <div className="text-[#0c2f42] text-lg">
                You can control cookies through your browser settings. Here are links
                to instructions for popular browsers:
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42] mt-3">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A8C117] hover:underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A8C117] hover:underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A8C117] hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A8C117] hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              5. Cookie Duration
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Cookies can be either "session" cookies or "persistent" cookies:
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                <strong>Session cookies:</strong> Temporary cookies that expire when
                you close your browser
              </li>
              <li>
                <strong>Persistent cookies:</strong> Remain on your device for a set
                period or until you delete them
              </li>
            </ul>
            <div className="text-[#0c2f42] text-lg mt-5">
              Our cookies are stored for the following durations:
            </div>
            <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42] mt-3">
              <li>
                <strong>admin-auth:</strong> 7 days (session management)
              </li>
              <li>
                <strong>cookie-consent:</strong> 1 year (your preferences)
              </li>
            </ul>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              6. Third-Party Cookies
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Our website may contain embedded content from third-party services that
              may set their own cookies. We have no control over these cookies. We
              only load third-party content after you provide consent.
            </div>
            <div className="text-[#0c2f42] text-lg mb-5">
              Third-party services we use:
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                <strong>YouTube:</strong>{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A8C117] hover:underline"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google Maps:</strong>{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A8C117] hover:underline"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google Fonts:</strong>{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A8C117] hover:underline"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              7. Changes to This Cookie Policy
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We may update this Cookie Policy from time to time to reflect changes
              in our practices or for legal, operational, or regulatory reasons. We
              will notify you of any material changes by posting the new Cookie Policy
              on this page and updating the "Last Updated" date.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              8. Contact Us
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              If you have any questions about our use of cookies or this Cookie
              Policy, please contact us:
              <br />
              <br />
              <span>
                Mail:{" "}
                <a
                  href="mailto:sales@taypro.in"
                  className="hover:text-[#A8C117] transition-colors"
                >
                  sales@taypro.in
                </a>
              </span>
              <span className="hidden sm:block mx-2"></span>
              <span>
                Phone:{" "}
                <a
                  href="tel:+918956114050"
                  className="hover:text-[#A8C117] transition-colors"
                >
                  +918956114050
                </a>
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}


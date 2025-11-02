import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy at Taypro Private Limited",
  description:
    "Taypro (“we,” “our,” “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, products, and services (collectively, the “Services”).",
  keywords:
    "taypro privacy policy, privacy, policy terms, privacy rights, secured information, data practices, taypro",
  openGraph: {
    title: "Privacy Policy at Taypro Private Limited",
    description:
      "Taypro (“we,” “our,” “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, products, and services (collectively, the “Services”).",
    url: "https://taypro-dashboard.vercel.app/privacy-policy",
    type: "website",
  },
};

export default function PrivacyPolicySection() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Privacy Policy", href: "" },
  ];
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="w-full bg-white py-15">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-[#0c2f42] text-center font-semibold text-7xl mb-20">
              Privacy Policy
            </h1>

            <div className="mt-8">
              <h2 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                Privacy Policy
              </h2>
              <div className="text-[#0c2f42] text-lg mb-8 font-normal">
                Effective Date: 01-07-2020
              </div>
              <div className="text-[#0c2f42] text-lg font-normal leading-9">
                Taypro (“we,” “our,” “us”) is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                website, products, and services (collectively, the “Services”).
                Please read this Privacy Policy carefully. If you do not agree
                with the terms of this Privacy Policy, please do not use our
                Services.
              </div>
              <hr className="border border-gray-300 mt-8" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              1. Information We Collect
            </h3>
            <div className="text-[#0c2f42] text-lg mb-10">
              We may collect information about you in various ways. The types of
              information we collect include:
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                a. Personal Information
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                When you interact with our Services, we may collect personal
                information such as:
              </div>
              <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
                <li>
                  Your name, email address, phone number, and mailing address.
                </li>
                <li>Company name and job title (if applicable).</li>
                <li>
                  Payment information (processed securely via third-party
                  providers).
                </li>
              </ul>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                b. Non-Personal Information
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                We may also collect non-personal information, such as:
              </div>
              <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
                <li>
                  Device and browser information (e.g., IP address, operating
                  system, and browser type).
                </li>
                <li>
                  Usage data, including pages visited, links clicked, and other
                  actions taken on our website.
                </li>
                <li>Location data (if enabled on your device).</li>
              </ul>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                c. Information from Third Parties
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                We may receive information about you from third-party sources,
                such as business partners, public databases, and social media
                platforms.
              </div>
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              2. How We Use Your Information
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We use the information we collect for various purposes, including:
            </div>

            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>To provide, operate, and improve our Services.</li>
              <li>To process transactions and send purchase confirmations.</li>
              <li>
                To communicate with you about updates, promotions, and important
                notices.
              </li>
              <li>
                To personalize your experience and deliver tailored content.
              </li>
              <li>
                To comply with legal obligations and enforce our terms of use.
              </li>
            </ul>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              3. How We Share Your Information
            </h3>
            <div className="text-[#0c2f42] text-lg mb-10">
              We do not sell your personal information. However, we may share
              your information in the following circumstances:
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                a. With Service Providers
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                We may share your information with third-party vendors who
                perform services on our behalf, such as payment processing, data
                analysis, and customer support.
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                b. For Legal Compliance
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                We may disclose your information to comply with legal
                obligations, respond to lawful requests, or protect our legal
                rights.
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                c. With Your Consent
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                We may share your information for other purposes with your
                explicit consent.
              </div>
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              4. Data Retention
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We retain your personal information only as long as necessary to
              fulfill the purposes outlined in this Privacy Policy or as
              required by law. Non-personal information may be retained
              indefinitely for analytical purposes.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              5. Security of Your Information
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We implement reasonable security measures to protect your
              information from unauthorized access, disclosure, alteration, or
              destruction. However, no security system is entirely foolproof,
              and we cannot guarantee the absolute security of your data.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              6. Your Privacy Rights
            </h3>
            <div className="text-[#0c2f42] text-lg mb-10">
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </div>

            <ul className="list-disc mb-10 pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                The right to access, correct, or delete your personal
                information.
              </li>
              <li>
                The right to object to or restrict the processing of your data.
              </li>
              <li>The right to data portability.</li>
              <li>The right to withdraw consent at any time.</li>
            </ul>

            <div className="text-[#0c2f42] text-lg mb-10">
              To exercise your rights, please contact us at [Insert Contact
              Email].
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              7. Cookies and Tracking Technologies
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We use cookies and similar technologies to enhance your experience
              on our website. You can control or disable cookies through your
              browser settings. Note that disabling cookies may impact the
              functionality of our Services.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              8. Third-Party Links
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices or content of these external
              sites. Please review their privacy policies before providing any
              information.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              9. Children’s Privacy
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Our Services are not directed to individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              we become aware that we have collected information from a child
              without parental consent, we will delete it promptly.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              10. Changes to This Privacy Policy
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated “Effective Date.” We
              encourage you to review this Privacy Policy periodically to stay
              informed about how we are protecting your information.
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              11. Contact Us
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us:
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

import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Taypro - Solar Panel Cleaning Robots",
  description:
    "Read Taypro's Terms of Service. Understand the terms and conditions for using our website, products, and services.",
  keywords: "terms of service, terms and conditions, taypro, legal",
  openGraph: {
    title: "Terms of Service | Taypro",
    description: "Terms and conditions for using Taypro's website and services.",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Terms of Service", href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <section className="w-full bg-white py-15">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-[#0c2f42] text-center font-semibold text-7xl mb-20">
              Terms of Service
            </h1>

            <div className="mt-8">
              <h2 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                Terms of Service
              </h2>
              <div className="text-[#0c2f42] text-lg mb-8 font-normal">
                Last Updated: {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-[#0c2f42] text-lg font-normal leading-9">
                Please read these Terms of Service ("Terms") carefully before using
                the website operated by Taypro Private Limited ("we," "our," "us").
                By accessing or using our website, you agree to be bound by these
                Terms. If you disagree with any part of these terms, you may not
                access or use our services.
              </div>
              <hr className="border border-gray-300 mt-8" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              1. Acceptance of Terms
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              By accessing and using this website, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree to
              abide by the above, please do not use this service.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              2. Use License
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Permission is granted to temporarily download one copy of the materials
              on Taypro's website for personal, non-commercial transitory viewing
              only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempt to reverse engineer any software contained on the website
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transfer the materials to another person or "mirror" the materials
                on any other server
              </li>
            </ul>
            <div className="text-[#0c2f42] text-lg mt-5">
              This license shall automatically terminate if you violate any of these
              restrictions and may be terminated by Taypro at any time.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              3. Disclaimer
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              The materials on Taypro's website are provided on an 'as is' basis.
              Taypro makes no warranties, expressed or implied, and hereby disclaims
              and negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other
              violation of rights.
            </div>
            <div className="text-[#0c2f42] text-lg mb-5">
              Further, Taypro does not warrant or make any representations
              concerning the accuracy, likely results, or reliability of the use of
              the materials on its website or otherwise relating to such materials or
              on any sites linked to this site.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              4. Limitations
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              In no event shall Taypro or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or
              due to business interruption) arising out of the use or inability to
              use the materials on Taypro's website, even if Taypro or an authorized
              representative has been notified orally or in writing of the
              possibility of such damage.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              5. Accuracy of Materials
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              The materials appearing on Taypro's website could include technical,
              typographical, or photographic errors. Taypro does not warrant that any
              of the materials on its website are accurate, complete, or current.
              Taypro may make changes to the materials contained on its website at
              any time without notice.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              6. Links
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Taypro has not reviewed all of the sites linked to its website and is
              not responsible for the contents of any such linked site. The inclusion
              of any link does not imply endorsement by Taypro of the site. Use of
              any such linked website is at the user's own risk.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              7. Modifications
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              Taypro may revise these Terms of Service at any time without notice.
              By using this website, you are agreeing to be bound by the then current
              version of these Terms of Service.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">
              8. Governing Law
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              These terms and conditions are governed by and construed in accordance
              with the laws of India, and you irrevocably submit to the exclusive
              jurisdiction of the courts in that location.
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              9. Contact Information
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              If you have any questions about these Terms of Service, please contact
              us:
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


import { Facebook, Instagram, Linkedin, Youtube, X } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    "Important Links Left": [
      { name: "About Us", href: "/company" },
      { name: "Projects", href: "/projects" },
      { name: "Blogs", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    "Important Links Right": [
      { name: "Sitemap", href: "/sitemap" },
      { name: "Our Technology", href: "/cleaning-technology" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      {
        name: "Our Solutions",
        href: "/solar-robots/solar-panel-cleaning-robot",
      },
    ],
  };

  return (
    <footer className="bg-[#052638]">
      {/* Top Bar - Mail, Phone, Social Icons */}
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-4 border-[#17405c]">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-white text-base">
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
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <a
            href="https://www.facebook.com/taypro.official?_gl=1*1i9ka0l*_ga*MTU1NzYyODIyMi4xNzQyMzU5NjM5*_ga_7G1M6KFY3K*czE3NTg2OTkxNTUkbzMkZzAkdDE3NTg2OTkxNTUkajYwJGwwJGgw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-[#F1EFE6] p-1 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Facebook className="text-[#052638] w-4 h-4" />
            </div>
          </a>
          <a
            href="https://x.com/taypro_official?_gl=1*1i9ka0l*_ga*MTU1NzYyODIyMi4xNzQyMzU5NjM5*_ga_7G1M6KFY3K*czE3NTg2OTkxNTUkbzMkZzAkdDE3NTg2OTkxNTUkajYwJGwwJGgw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-[#F1EFE6] p-1 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <X className="text-[#052638] w-4 h-4" />
            </div>
          </a>
          <a
            href="https://www.instagram.com/taypro_official/?_gl=1*1i9ka0l*_ga*MTU1NzYyODIyMi4xNzQyMzU5NjM5*_ga_7G1M6KFY3K*czE3NTg2OTkxNTUkbzMkZzAkdDE3NTg2OTkxNTUkajYwJGwwJGgw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-[#F1EFE6] p-1 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Instagram className="text-[#052638] w-4 h-4" />
            </div>
          </a>
          <a
            href="https://www.linkedin.com/company/taypro?_gl=1*wpuod0*_ga*MTU1NzYyODIyMi4xNzQyMzU5NjM5*_ga_7G1M6KFY3K*czE3NTg2OTkxNTUkbzMkZzAkdDE3NTg2OTkxNTUkajYwJGwwJGgw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-[#F1EFE6] p-1 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Linkedin className="text-[#052638] w-4 h-4" />
            </div>
          </a>
          <a
            href="https://www.youtube.com/c/taypro"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="bg-[#F1EFE6] p-1 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Youtube className="text-[#052638] w-4 h-4" />
            </div>
          </a>
        </div>
      </div>

      <div className=" max-w-7xl mx-auto px-12 sm:px-12 lg:px-20 py-10 mb-4">
        {/* Main Footer Content */}
        <div className="  flex flex-col md:flex-row justify-between w-full mb-8 gap-20">
          {/* Company Info (Explore) */}
          <div className="md:w-1/2 ">
            <div className="text-lg text-white mb-4">Explore</div>
            <div className="space-y-5">
              {[
                {
                  name: "Model-B",
                  href: "/solar-robots/semi-automatic-solar-panel-cleaning-system",
                },
                {
                  name: "Automatic Solar Panel Cleaning Robot",
                  href: "/solar-robots/automatic-solar-panel-cleaning-robot",
                },
                {
                  name: "Model-T",
                  href: "/solar-robots/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
                },
              ].map((item) => (
                <div className="group cursor-pointer" key={item.name}>
                  <hr className="border-white mb-4 group-hover:border-[#A8C117] transition-colors duration-300" />
                  <a
                    href={item.href}
                    className="text-4xl font-semibold text-white mb-2 group-hover:text-[#A8C117] transition-colors duration-300"
                  >
                    {item.name}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex justify-between  md:w-1/3">
            {/* Left Column */}
            <div>
              <div className="text-lg text-white mb-4">Important Links</div>
              <ul className="space-y-2">
                {footerSections["Important Links Left"].map((link) => (
                  <li key={link.name} className="relative">
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-[#A8C117] transition duration-200 relative inline-block group"
                    >
                      {link.name}
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#A8C117] group-hover:w-full transition-all duration-300 ease-out transform origin-left"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <div className="text-lg text-white mb-4 invisible">
                Important Links
              </div>
              <ul className="space-y-2">
                {footerSections["Important Links Right"].map((link) => (
                  <li key={link.name} className="relative">
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-[#A8C117] transition duration-200 relative inline-block group"
                    >
                      {link.name}
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#A8C117] group-hover:w-full transition-all duration-300 ease-out transform origin-left"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg">
              © Copyright {currentYear} –{" "}
              <span style={{ color: "#A8C117" }}>TAYPRO PRIVATE LIMITED.</span>{" "}
              All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

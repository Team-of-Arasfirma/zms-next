import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full bg-[#1d2b3a] text-white">
      <div className="mx-auto max-w-[1180px] px-5 pb-4 pt-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-14">
          {/* Logo and social links */}
          <div className="flex flex-col items-start">
            <Link
              href="/"
              aria-label="Go to ZMS home page"
              className="block w-[170px]"
            >
              <Image
                src="/logo/white.svg"
                alt="Zaron Metal Sections"
                width={170}
                height={100}
                loading="lazy"
                className="h-auto w-full object-contain"
              />
            </Link>

            <div className="mt-5 flex items-center gap-5 pl-7">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919655966676"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-white transition-colors duration-200 hover:text-[#ff6b2c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.6-5.8A8.5 8.5 0 1 1 8.8 19L3 21z" />

                  <path d="M8.5 8.5c.2 3 3 5.8 6 6l1.5-1.5c.2-.2.2-.5 0-.7l-1.2-1.2c-.2-.2-.5-.2-.7 0l-.8.8c-1.3-.5-2.4-1.6-2.9-2.9l.8-.8c.2-.2.2-.5 0-.7L10 6.3c-.2-.2-.5-.2-.7 0L8.5 8.5z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/zaron_metal_sections/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white transition-colors duration-200 hover:text-[#ff6b2c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                  />

                  <path d="M16 11.37A4 4 0 1 1 12.63 8A4 4 0 0 1 16 11.37z" />

                  <path d="M17.5 6.5h.01" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/zmsipl/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="font-['Poppins'] text-[24px] font-bold leading-none text-white transition-colors duration-200 hover:text-[#ff6b2c]"
              >
                f
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@ZaronMetalSections"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white transition-colors duration-200 hover:text-[#ff6b2c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="4" />

                  <path d="M10 9l5 3-5 3V9z" />
                </svg>
              </a>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-['Poppins'] text-[20px] font-semibold text-white">
              About Us
            </h3>

            <p className="mt-4 max-w-[280px] font-['Poppins'] text-[12px] leading-[1.65] text-white/85">
              Zaron Metal Sections India Private Limited (ZMSIPL) is a leading
              name in the industrial manufacturing sector, specializing in
              high-quality and innovative steel solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-['Poppins'] text-[20px] font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-3 font-['Poppins'] text-[12px] text-white/85">
              <li>
                <Link href="/" className="transition hover:text-[#ff6b2c]">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="transition hover:text-[#ff6b2c]"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/product"
                  className="transition hover:text-[#ff6b2c]"
                >
                  Products
                </Link>
              </li>

              <li>
                <Link
                  href="/project"
                  className="transition hover:text-[#ff6b2c]"
                >
                  Projects
                </Link>
              </li>

              <li>
                <Link
                  href="/blog"
                  className="transition hover:text-[#ff6b2c]"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  href="/career"
                  className="transition hover:text-[#ff6b2c]"
                >
                  Career
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-[#ff6b2c]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-['Poppins'] text-[20px] font-semibold text-white">
              Contact Details
            </h3>

            <ul className="mt-4 space-y-4 font-['Poppins'] text-[12px] text-white/85">
              {/* Address */}
              <li className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-[#ff6b2c]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />

                    <circle
                      cx="12"
                      cy="9"
                      r="2.5"
                      fill="#1d2b3a"
                    />
                  </svg>
                </span>

                <span className="leading-[1.65]">
                  Zaron Metal Sections India Private Limited
                  <br />
                  5/114/1, Avinashilingampalayam,
                  <br />
                  Palangarai, Avinashi Taluk,
                  <br />
                  Avinashi, Tirupur,
                  <br />
                  Tamil Nadu - 641654
                </span>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-[#ff6b2c]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />

                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>

                <span className="flex flex-col gap-1">
                  <a
                    href="mailto:sales@zmsipl.com"
                    className="transition hover:text-[#ff6b2c]"
                  >
                    sales@zmsipl.com
                  </a>

                  <a
                    href="mailto:marketing@zmsipl.com"
                    className="transition hover:text-[#ff6b2c]"
                  >
                    marketing@zmsipl.com
                  </a>
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <span className="shrink-0 text-[#ff6b2c]">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19 19.5 19.5 0 0 1 5 12.81 19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.57 2.5a2 2 0 0 1-.45 2.11L7.9 9.61a16 16 0 0 0 6.49 6.49l1.28-1.28a2 2 0 0 1 2.11-.45c.8.25 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>

                <a
                  href="tel:+919655966676"
                  className="transition hover:text-[#ff6b2c]"
                >
                  +91 96559 66676
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-9 border-t border-white/10 pt-4 text-center font-['Poppins'] text-[12px] text-white/80">
          © Copyright 2026. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
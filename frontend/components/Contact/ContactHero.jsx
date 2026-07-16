"use client";

import { motion } from "framer-motion";

const PhoneIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19 19.5 19.5 0 0 1 5 12.81 19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.57 2.5a2 2 0 0 1-.45 2.11L7.9 9.61a16 16 0 0 0 6.49 6.49l1.28-1.28a2 2 0 0 1 2.11-.45c.8.25 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SupportIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
  </svg>
);

const ServiceIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a6 6 0 0 1-8 8L6.4 20.6a2 2 0 0 1-3-3l6.3-6.3a6 6 0 0 1 8-8l-3 3z" />
  </svg>
);

const BuildingIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9h1" />
    <path d="M9 13h1" />
    <path d="M9 17h1" />
  </svg>
);

const ContactHero = () => {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-white px-4 pt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,44,0.16),transparent_35%),radial-gradient(circle_at_15%_75%,rgba(29,43,58,0.10),transparent_38%)]"></div>

      <div className="absolute right-[-140px] top-20 h-[420px] w-[420px] rounded-full bg-[#ff6b2c]/10"></div>
      <div className="absolute left-[-160px] bottom-10 h-[360px] w-[360px] rounded-full bg-[#1d2b3a]/8"></div>

      {/* Dot Pattern Left */}
      <div className="absolute left-10 top-32 hidden grid-cols-4 gap-3 lg:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[#ff6b2c]/30"
          ></span>
        ))}
      </div>

      {/* Dot Pattern Right */}
      <div className="absolute bottom-28 right-16 hidden grid-cols-5 gap-3 lg:grid">
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[#1d2b3a]/20"
          ></span>
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <div className="mx-auto mb-5 h-[3px] w-20 rounded-full bg-[#ff6b2c] lg:mx-0"></div>

          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.3em] text-[#ff6b2c]">
            Contact Us
          </p>

          <h1 className="mt-4 font-['Bebas_Neue'] text-5xl leading-tight tracking-wide text-[#1d2b3a] sm:text-6xl md:text-7xl">
            Let’s Discuss Your Steel Project
          </h1>

          <p className="mx-auto mt-5 max-w-2xl font-[Lato] text-base leading-8 text-gray-600 md:text-lg lg:mx-0">
            Connect with Zaron Metal Sections for purlins, fabrication,
            roofing support, and industrial steel structure solutions.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b2c] px-8 py-4 font-[Poppins] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,107,44,0.28)] transition-all duration-300 hover:bg-[#1d2b3a]"
            >
              <PhoneIcon />
              Call Now
            </a>

            <a
              href="mailto:info@zaronmetalsections.com"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1d2b3a]/20 bg-white px-8 py-4 font-[Poppins] text-sm font-semibold text-[#1d2b3a] shadow-[0_10px_30px_rgba(29,43,58,0.08)] transition-all duration-300 hover:border-[#ff6b2c] hover:bg-[#ff6b2c] hover:text-white"
            >
              <MailIcon />
              Send Email
            </a>
          </div>

          {/* Info Cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-[0_10px_35px_rgba(29,43,58,0.08)] backdrop-blur">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c] lg:mx-0">
                <PhoneIcon />
              </div>
              <p className="mt-3 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
                Quick Response
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-[0_10px_35px_rgba(29,43,58,0.08)] backdrop-blur">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c] lg:mx-0">
                <ServiceIcon />
              </div>
              <p className="mt-3 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
                Project Support
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-[0_10px_35px_rgba(29,43,58,0.08)] backdrop-blur">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c] lg:mx-0">
                <BuildingIcon />
              </div>
              <p className="mt-3 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
                Steel Solutions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto flex h-[440px] w-full max-w-[540px] items-center justify-center"
        >
          <div className="absolute h-[390px] w-[390px] rounded-[42%_58%_55%_45%/45%_45%_55%_55%] bg-[#ff6b2c]/12"></div>

          <div className="absolute right-8 top-8 h-[220px] w-[220px] rounded-full bg-[#1d2b3a]/8"></div>

          <div className="absolute h-[330px] w-[330px] rounded-full border-2 border-dashed border-[#ff6b2c]/35"></div>

          {/* Main Contact Card */}
          <div className="relative z-10 w-[280px] rounded-[32px] border border-gray-100 bg-white p-7 shadow-[0_25px_70px_rgba(29,43,58,0.18)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c]">
              <MailIcon />
            </div>

            <h3 className="mt-5 text-center font-['DM_Serif_Display'] text-2xl text-[#1d2b3a]">
              Contact Team
            </h3>

            <p className="mt-2 text-center font-[Poppins] text-sm leading-6 text-gray-500">
              We are ready to help your next project.
            </p>
          </div>

          {/* Floating Location */}
          <div className="absolute left-0 top-12 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_15px_45px_rgba(29,43,58,0.14)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c]">
              <LocationIcon />
            </div>

            <p className="mt-2 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
              Location
            </p>
          </div>

          {/* Floating Phone */}
          <div className="absolute right-0 top-20 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_15px_45px_rgba(29,43,58,0.14)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c]">
              <PhoneIcon />
            </div>

            <p className="mt-2 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
              Phone
            </p>
          </div>

          {/* Floating Support */}
          <div className="absolute bottom-16 left-8 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_15px_45px_rgba(29,43,58,0.14)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c]">
              <SupportIcon />
            </div>

            <p className="mt-2 font-[Poppins] text-xs font-semibold text-[#1d2b3a]">
              Support
            </p>
          </div>

          {/* Floating Service */}
          <div className="absolute bottom-10 right-8 flex flex-col items-center justify-center rounded-2xl bg-[#ff6b2c] px-5 py-4 shadow-[0_15px_45px_rgba(255,107,44,0.28)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              <ServiceIcon />
            </div>

            <p className="mt-2 font-[Poppins] text-xs font-semibold text-white">
              Service
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;
"use client";

import React from "react";
import { motion } from "framer-motion";

const CertificationAwards = () => {
  return (
    <section className="w-full bg-[#f2f2f2] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          className="rounded-[8px] bg-white px-8 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:px-10"
          initial={{ y: 35, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[6px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Certifications
          </p>

          <h2
            className="whitespace-nowrap text-[30px] leading-none text-[#111111] sm:text-[34px] lg:text-[36px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            ISO CERTIFICATIONS & COMPLIANCE
          </h2>

          <div className="mt-4 h-[3px] w-[64px] rounded-full bg-[#ff6b2c]" />

          <div className="mt-8 flex h-[520px] items-center justify-center">
            <img
              src="/about/iso-certificate.jpg"
              alt="ISO Certifications and Compliance"
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          className="rounded-[8px] bg-white px-8 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:px-10"
          initial={{ y: 35, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[6px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Recognition
          </p>

          <h2
            className="whitespace-nowrap text-[30px] leading-none text-[#111111] sm:text-[34px] lg:text-[36px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            AWARDS & ACHIEVEMENTS
          </h2>

          <div className="mt-4 h-[3px] w-[64px] rounded-full bg-[#ff6b2c]" />

          <div className="mt-8 flex h-[520px] items-center justify-center">
            <img
              src="/about/iso-certificate.jpg"
              alt="Awards and Achievements"
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationAwards;
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="w-full overflow-hidden bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1180px] px-5">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="w-full rounded-[6px] bg-[#ff6b2c] px-5 py-8 text-center shadow-[0_10px_25px_rgba(255,107,44,0.22)] md:py-9"
        >
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-['DM_Serif_Display'] text-[28px] leading-tight text-white sm:text-[34px] md:text-[38px]"
          >
            Ready to Start Your Project?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            viewport={{ once: true }}
            className="mt-3 font-['Poppins'] text-[13px] leading-relaxed text-white sm:text-[14px]"
          >
            Get a custom quote for your steel purlin, metal processing, or solar
            mounting requirements.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            viewport={{ once: true }}
            className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="flex h-[44px] w-full items-center justify-center rounded-[6px] bg-white font-['Poppins'] text-[12px] font-semibold text-[#ff6b2c] transition-all duration-200 sm:w-[170px]"
            >
              Get Free Quote
            </Link>

            <a
              href="tel:+919655966676"
              className="flex h-[44px] w-full items-center justify-center rounded-[6px] border border-white/70 font-['Poppins'] text-[12px] font-medium text-white transition-all duration-200 hover:bg-white hover:text-[#ff6b2c] sm:w-[170px]"
            >
              Call Us Now
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";

const CareerHero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
      {/* Background design */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[45%] bg-[#fde0cf] sm:block" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        <motion.div
          className="max-w-[760px]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[4px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Careers
          </p>

          <h1
            className="mb-5 text-[46px] leading-none text-[#5a5a5a] sm:text-[58px] lg:text-[68px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            BUILD YOUR FUTURE WITH{" "}
            <span className="text-[#ff6b2c]">ZMS</span>
          </h1>

          <p
            className="max-w-[720px] text-[15px] font-medium leading-[2] text-[#5f5f5f] sm:text-[16px] lg:text-[17px]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Join Zaron Metal Sections and grow your career with a team focused
            on steel structures, solar mounting systems, fabrication, and
            modern industrial infrastructure solutions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerHero;
"use client";

import React from "react";
import { motion } from "framer-motion";

const AboutHero = () => {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden bg-[#f7f4f1] py-14 sm:py-16 lg:py-20"
    >
      {/* Right Side Animated Wave Design */}
      <motion.div
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] sm:block"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.svg
          className="h-full w-full"
          viewBox="0 0 520 220"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ x: [0, 12, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.path
            d="M170 0H520V220H300C280 175 315 130 245 85C185 47 190 25 200 0H170Z"
            fill="#FDE0CF"
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.path
            d="M135 0C115 42 137 62 200 102C262 142 250 178 268 220H235C215 180 235 148 175 110C100 62 90 35 105 0H135Z"
            fill="#FDBB91"
            animate={{ x: [0, -8, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.path
            d="M165 0C145 40 165 60 225 100C292 145 282 178 300 220H268C250 178 262 142 200 102C137 62 115 42 135 0H165Z"
            fill="#FFC9A8"
            animate={{ x: [0, 8, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.path
            d="M205 0C185 35 205 55 260 92C330 140 318 178 340 220H300C282 178 292 145 225 100C165 60 145 40 165 0H205Z"
            fill="#FDE0CF"
            animate={{ x: [0, -6, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        <motion.div
          className="max-w-[720px]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#ff6b2c]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            About Us
          </p>

          <h1
            className="mb-5 text-[42px] leading-none text-[#5a5a5a] sm:text-[50px] lg:text-[58px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            ABOUT <span className="text-[#ff6b2c]">ZMS</span>
          </h1>

          <p
            className="max-w-[700px] text-[16px] font-medium leading-[2] text-[#5f5f5f] sm:text-[16px]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Zaron Metal Sections India Pvt Ltd is a leading manufacturer and
            supplier of precision-engineered solar MMS structures and metal
            purlins. We specialize in delivering structural solutions tailored
            for solar energy projects and industrial infrastructure. ZMS was
            formally established as an independent entity in 2017 and has since
            become a core pillar of Zaron Industries.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
"use client";

import React from "react";
import { motion } from "framer-motion";

const values = [
  {
    title: "Our Mission",
    description:
      "To manufacture world-class steel products that empower builders, developers, and solar installers to construct with confidence and precision.",
  },
  {
    title: "Our Vision",
    description:
      "To be India's most trusted industrial steel manufacturer, known for uncompromising quality and exceptional customer service.",
  },
  {
    title: "Our Values",
    description:
      "Quality without compromise. Innovation in every product. Integrity in every transaction. Sustainability in every process.",
  },
];

const MissionVisionValues = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        {/* Section Heading */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[4px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Our Foundation
          </p>

          <h2
            className="text-[42px] leading-none text-[#111111] sm:text-[52px] lg:text-[58px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            MISSION, VISION & VALUES
          </h2>

          <div className="mt-4 h-[3px] w-[44px] rounded-full bg-[#ff6b2c]" />
        </motion.div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 md:grid-cols-3 lg:gap-10">
          {values.map((item, index) => (
            <motion.div
              key={index}
              className="rounded-[10px] bg-white px-6 py-7 shadow-[0_8px_25px_rgba(0,0,0,0.08)] sm:px-7 lg:px-8"
              initial={{ y: 35, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              whileHover={{
                y: -6,
                boxShadow: "0 14px 35px rgba(0,0,0,0.12)",
              }}
            >
              <h3
                className="mb-4 text-[22px] font-normal leading-none text-[#14213d] sm:text-[24px] lg:text-[25px]"
                style={{ fontFamily: "DM Serif Display, serif" }}
              >
                {item.title}
              </h3>

              <p
                className="text-[13px] font-medium leading-[1.75] text-[#63708a] sm:text-[14px]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValues;
"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  {
    number: "30",
    label: "High-Capacity\nMachines",
  },
  {
    number: "500+",
    label: "Projects\nCompleted",
  },
  {
    number: "2+",
    label: "Years\nExperience",
  },
  {
    number: "2",
    smallText: "Plants",
    label: "We Operate Dual\nModern Facilities.",
  },
  {
    number: "ISO",
    label: "Certified\nManufacturer",
  },
];

const StatsBar = () => {
  return (
    <section className="w-full bg-white">
      <div className="w-full bg-[#ff7429] py-7 sm:py-8">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:px-20">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              className="relative flex min-h-[88px] flex-col items-center justify-center text-center text-white"
              initial={{ y: 25, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              {/* Divider */}
              {index !== stats.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-[72px] w-[5px] -translate-y-1/2 bg-white lg:block" />
              )}

              <h3
                className="mb-3 flex items-end justify-center text-[42px] leading-none tracking-wide sm:text-[46px] lg:text-[48px]"
                style={{ fontFamily: "Bebas Neue, sans-serif" }}
              >
                {item.number}
                {item.smallText && (
                  <span
                    className="mb-1 ml-1 text-[13px] font-medium normal-case tracking-normal"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {item.smallText}
                  </span>
                )}
              </h3>

              <p
                className="whitespace-pre-line text-[13px] font-normal leading-[1.45] text-white sm:text-[14px]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
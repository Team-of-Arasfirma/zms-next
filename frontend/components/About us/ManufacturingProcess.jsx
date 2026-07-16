"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Pencil,
  Settings,
  PaintRoller,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

const processSteps = [
  {
    id: "01",
    icon: Layers,
    title: "Coil Sourcing",
    text: "Mother coils procured from trusted suppliers",
  },
  {
    id: "02",
    icon: Pencil,
    title: "Coil Slitting",
    text: "Cut into required sizes with high accuracy",
  },
  {
    id: "03",
    icon: Settings,
    title: "Section Forming",
    text: "Roll forming into desired structural profiles",
  },
  {
    id: "04",
    icon: PaintRoller,
    title: "Surface Finishing",
    text: "Smooth, treated finish for durability",
  },
  {
    id: "05",
    icon: ShieldCheck,
    title: "Quality Check",
    text: "Strict inspection standards",
  },
  {
    id: "06",
    icon: PackageCheck,
    title: "Dispatch",
    text: "Carefully packed and delivered on time",
  },
];

const ManufacturingProcess = () => {
  return (
    <section className="w-full bg-[#f7f7f7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Heading */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[5px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Manufacturing Process
          </p>

          <h2
            className="text-[42px] leading-none text-[#111111] sm:text-[52px] lg:text-[58px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            HOW WE MANUFACTURE
          </h2>

          <div className="mt-4 h-[3px] w-[44px] rounded-full bg-[#ff6b2c]" />
        </motion.div>

        {/* Cards */}
        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-7">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                className="relative min-h-[178px] overflow-hidden border-l-[4px] border-[#ff6b2c] bg-white px-8 py-7 shadow-[0_5px_8px_rgba(0,0,0,0.18)]"
                initial={{ y: 35, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 12px 22px rgba(0,0,0,0.16)",
                }}
              >
                {/* Big Background Number */}
                <span
                  className="absolute right-5 top-5 text-[52px] font-bold leading-none text-[#ff6b2c]/15"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {step.id}
                </span>

                <Icon
                  className="mb-7 h-5 w-5 text-[#ff6b2c]"
                  strokeWidth={2}
                />

                <h3
                  className="mb-4 text-[18px] font-normal leading-none text-[#ff6b2c]"
                  style={{ fontFamily: "DM Serif Display, serif" }}
                >
                  {step.title}
                </h3>

                <p
                  className="max-w-[180px] text-[13px] font-medium leading-[1.25] text-[#ff6b2c]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ManufacturingProcess;
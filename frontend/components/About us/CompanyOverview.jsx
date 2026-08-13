"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const CompanyOverview = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24 lg:px-20">
        <motion.div
          className="order-1"
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[4px] text-[#ff6b2c]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Our Story
          </p>

          <h2
            className="text-[42px] leading-none text-[#111111] sm:text-[52px] lg:text-[58px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            COMPANY OVERVIEW
          </h2>

          <div className="mt-4 h-[3px] w-[44px] rounded-full bg-[#ff6b2c]" />

          <p
            className="mt-6 max-w-[600px] text-[15px] font-medium leading-[2] text-[#5f5f5f] sm:text-[16px] lg:text-[17px]"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Zaron Metal Sections India Private Limited - Module Mounting
            Structure Manufacturer is a dedicated and reliable company
            specializing in the design, fabrication, and installation of
            high-quality structural solutions. With a strong commitment to
            precision, durability, and innovation, we deliver customized
            manufacturing services tailored to meet the diverse needs of our
            clients. Our expertise spans across a wide range of structural works,
            including MMS structures, steel fabrication, and industrial
            frameworks. We utilize advanced technology, skilled craftsmanship,
            and strict quality control measures to ensure every project meets
            industry standards and exceeds customer expectations.
          </p>
        </motion.div>

        <motion.div
          className="relative order-2 mx-auto h-[360px] w-full max-w-[620px] sm:h-[430px] lg:mx-0 lg:h-[430px]"
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="absolute right-0 top-0 z-10 aspect-video w-full max-w-[560px] overflow-hidden rounded-[22px] shadow-sm">
            <Image
              src="/assets/about/factory.jpg"
              alt="ZMS factory overview"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              loading="lazy"
              quality={70}
              className="object-cover object-center"
            />
          </div>

          <div className="absolute bottom-0 left-0 z-20 aspect-video w-[72%] max-w-[360px] overflow-hidden rounded-[22px] shadow-lg lg:left-[-10px]">
            <Image
              src="/assets/about/building.jpg"
              alt="ZMS manufacturing unit"
              fill
              sizes="(max-width: 1024px) 72vw, 360px"
              loading="lazy"
              quality={70}
              className="object-cover object-center"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyOverview;

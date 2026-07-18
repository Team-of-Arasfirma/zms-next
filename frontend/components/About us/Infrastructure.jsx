"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const Infrastructure = () => {
  return (
    <section className="w-full bg-[#f7f7f7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
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
            OUR INFRASTRUCTURE
          </h2>

          <div className="mt-4 h-[3px] w-[44px] rounded-full bg-[#ff6b2c]" />
        </motion.div>

        <div className="mt-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <motion.div
            className="relative mx-auto h-[360px] w-full max-w-[620px] sm:h-[430px] lg:mx-0 lg:h-[390px]"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="absolute left-0 top-0 z-10 h-[320px] w-[62%] overflow-hidden rounded-[8px] shadow-sm sm:h-[390px]">
              <Image
                src="/about/factory.jpg"
                alt="ZMS infrastructure"
                fill
                sizes="(max-width: 1024px) 62vw, 390px"
                loading="lazy"
                quality={70}
                className="object-cover object-center"
              />
            </div>

            <div className="absolute right-0 top-[26px] z-20 h-[270px] w-[62%] overflow-hidden rounded-[8px] shadow-md sm:top-[34px] sm:h-[330px]">
              <Image
                src="/about/f-in.jpg"
                alt="ZMS manufacturing infrastructure"
                fill
                sizes="(max-width: 1024px) 62vw, 330px"
                loading="lazy"
                quality={70}
                className="object-cover object-center"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 45, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p
              className="max-w-[610px] text-[15px] font-medium leading-[2] text-[#5f5f5f] sm:text-[16px] lg:text-[17px]"
              style={{ fontFamily: "Lato, sans-serif" }}
            >
              Our operations are powered by two state-of-the-art manufacturing
              facilities designed for efficiency, precision, and scalability.
              <br />
              <span className="font-bold text-[#4f4f4f]">Plant A</span> -
              Avinashi spans over 1.6 lakh sq. ft., equipped with advanced
              machinery capable of handling both heavy and light structural
              fabrication.
              <br />
              <span className="font-bold text-[#4f4f4f]">Plant B</span> -
              Palladam, covering 1.2 lakh sq. ft., supports our expansion with
              dedicated capabilities for logistics and specialized product
              manufacturing.
              <br />
              With 30+ high-capacity machines, including precision laser cutting
              systems, and a team of 500+ skilled professionals, we ensure
              consistent quality and high-volume production. Our 24-hour
              transport service enables seamless logistics and timely delivery
              across projects.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Infrastructure;

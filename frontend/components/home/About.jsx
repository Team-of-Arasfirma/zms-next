"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="w-full overflow-hidden bg-[#f2f2f2] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        {/* Main layout */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[130px_1fr_1fr] lg:gap-10">
          {/* Desktop ABOUT US vertical text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="hidden h-[420px] items-center justify-center lg:flex"
          >
            <div className="relative flex h-[130px] w-[420px] -rotate-90 items-center justify-center">
              <h2 className="whitespace-nowrap font-['Bebas_Neue'] text-[76px] leading-none tracking-wide text-[#111] uppercase">
                About Us
              </h2>

              <span className="absolute right-[197px] bottom-0 block h-[65px] w-[5px] rotate-90 rounded-full bg-[#ff762f]" />
            </div>
          </motion.div>

          {/* Mobile ABOUT US title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 lg:hidden"
          >
            <h2 className="whitespace-nowrap font-['Bebas_Neue'] text-[46px] leading-none tracking-wide text-[#111] uppercase">
              About Us
            </h2>

            <span className="block h-[4px] w-[45px] rounded-full bg-[#ff762f]" />
          </motion.div>

          {/* Image section */}
          <div className="grid grid-cols-2 items-center gap-4 md:gap-5">
            {/* Left big image */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[280px] overflow-hidden rounded-[22px] sm:h-[340px] md:h-[420px]"
            >
              <Image
                src="/about/factory.jpg"
                alt="ZMS factory"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>

            {/* Right side experience card and image */}
            <div className="flex flex-col gap-4 md:gap-5">
              {/* Experience box */}
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="rounded-[20px] bg-[#fff7f4] px-3 py-6 text-center md:py-8"
              >
                <h3 className="font-['Sarpanch'] text-xl font-extrabold tracking-wide text-[#ff6b2c] sm:text-2xl md:text-3xl">
                  2+ Years
                </h3>

                <p className="mt-1 font-['Lato'] text-xs text-[#ff6b2c] sm:text-sm">
                  Experience
                </p>
              </motion.div>

              {/* Right small image */}
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative h-[170px] overflow-hidden rounded-[22px] sm:h-[210px] md:h-[260px]"
              >
                <Image
                  src="/about/building.jpg"
                  alt="ZMS building"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Text section */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:pl-2"
          >
            <h1 className="font-['Bebas_Neue'] text-3xl leading-[1.05] font-normal tracking-wide text-[#ff6b2c] uppercase sm:text-4xl md:text-5xl lg:text-[50px]">
              Powering Solar Projects With Strong Mounting Structures
            </h1>

            <p className="mt-5 max-w-xl font-['Lato'] text-sm leading-7 text-[#555] md:text-base">
              Zaron Metal Sections India Pvt Ltd is a leading manufacturer and
              supplier of precision-engineered solar MMS structures and metal
              purlins. We specialize in delivering structural solutions tailored
              for solar energy projects and industrial infrastructure. ZMS was
              formally established as an independent entity in 2017 and has
              since become a core pillar of Zaron Industries.
            </p>

            {/* Read More button */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="mt-8 inline-block"
            >
              <Link
                href="/about"
                className="group inline-flex h-[46px] w-[160px] items-center justify-between rounded-full bg-[#ff762f] pr-[3px] pl-7 font-['Lato'] text-sm font-medium text-white transition-all duration-300 hover:bg-[#f06420]"
              >
                <span>Read More</span>

                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-white text-xl leading-none transition-all duration-300 group-hover:translate-x-[2px]">
                  →
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
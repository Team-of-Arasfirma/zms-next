"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const advantages = [
  {
    icon: "/icons/advantage/premium.svg",
    title: "Premium Quality",
    description: "Quality material + quality checking.",
  },
  {
    icon: "/icons/advantage/durability.svg",
    title: "Superior Durability",
    description: "Strong, weather resistant, long life.",
  },
  {
    icon: "/icons/advantage/fabrication.svg",
    title: "Custom Fabrication",
    description: "Client requirement and custom size/design.",
  },
  {
    icon: "/icons/advantage/delivery.svg",
    title: "Fast Delivery",
    description: "Quick production and dispatch.",
  },
];

// Cards parent animation
const cardContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Single card entry animation
const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 45,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const Advantage = () => {
  return (
    <section className="w-full overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        {/* Small heading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-['Poppins'] text-[11px] font-semibold uppercase tracking-[8px] text-[#ff6b2c]"
        >
          Why Choose Us
        </motion.p>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-6 font-['Bebas_Neue'] text-[52px] uppercase leading-none tracking-wide text-[#111] sm:text-[62px] md:text-[72px]"
        >
          Our Advantage
        </motion.h2>

        {/* Orange underline */}
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-5 block h-[4px] rounded-full bg-[#ff6b2c]"
        />

        {/* Cards wrapper */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-10 lg:grid-cols-4 lg:gap-[100px]"
        >
          {advantages.map((item) => (
            <motion.div
              key={item.title}
              variants={cardAnimation}
              whileHover={{
                y: -10,
                scale: 1.04,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              }}
              className="group relative flex min-h-[175px] w-full flex-col items-center justify-center overflow-hidden rounded-[5px] border border-[#ff9b6a] bg-white px-5 py-6 text-center transition-all duration-200 lg:w-[200px]"
            >
              {/* Hover line left to right */}
              <span className="absolute top-0 left-0 h-[3px] w-0 bg-[#ff6b2c] transition-all duration-500 ease-out group-hover:w-full" />

              {/* Icon box */}
              <motion.div
                whileHover={{
                  rotate: [0, -8, 8, 0],
                  scale: 1.12,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
                className="relative z-10 mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-[7px] bg-[#fff7f3]"
              >
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative h-[20px] w-[20px]"
                >
                  <Image
                    src={item.icon}
                    alt={item.title}
                    fill
                    sizes="20px"
                    loading="lazy"
                    quality={70}
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>

              {/* Card heading */}
              <h3 className="relative z-10 font-['DM_Serif_Display'] text-[18px] leading-tight text-[#ff6b2c]">
                {item.title}
              </h3>

              {/* Card description */}
              <p className="relative z-10 mt-3 font-['Poppins'] text-[12px] capitalize leading-[1.55] text-[#ff6b2c]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Advantage;

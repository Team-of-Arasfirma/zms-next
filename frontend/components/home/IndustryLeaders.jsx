"use client";

import { motion } from "framer-motion";

const leaders = [
  {
    id: 1,
    logo: "/L-logo/jsw.png",
    name: "JSW",
  },
  {
    id: 2,
    logo: "/L-logo/tata.png",
    name: "Tata Steel",
  },
];

export default function IndustryLeaders() {
  return (
    <section className="w-full overflow-hidden bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-5">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-['Poppins'] text-[10px] font-semibold uppercase tracking-[8px] text-[#ff6b2c]"
        >
          Trusted
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-5 font-['Bebas_Neue'] text-[42px] uppercase leading-none tracking-wide text-[#111] sm:text-[56px] md:text-[70px]"
        >
          Our Industry Leaders
        </motion.h2>

        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-5 block h-[4px] rounded-full bg-[#ff6b2c]"
        />

        <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-1 gap-7 sm:grid-cols-2">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 45, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              }}
              className="group flex h-[150px] items-center justify-center overflow-hidden rounded-[12px] border border-[#ff9b6a] bg-white p-5 shadow-[0_10px_22px_rgba(0,0,0,0.10)] md:h-[170px]"
            >
              <img
                src={leader.logo}
                alt={leader.name}
                className="max-h-[90px] max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-105 sm:max-w-[170px] md:max-w-[190px]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
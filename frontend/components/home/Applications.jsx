"use client";

import { motion } from "framer-motion";

const applications = [
  {
    image: "/applications/ground-mounted.jpg",
    title: "Ground Mounted",
    description:
      "Heavy-duty ground mounting systems for large-scale solar farms and open land installations with adjustable tilt angles.",
  },
  {
    image: "/applications/rooftop-mounted.jpg",
    title: "Rooftop Mounted",
    description:
      "Ideal for commercial and residential rooftops. Lightweight, corrosion-resistant galvanized steel frames engineered for any roof angle.",
  },
  {
    image: "/applications/newproject.jpg",
    title: "New Project",
    description:
      "Planning a new solar or industrial structure project? Our team designs and delivers custom steel solutions from scratch.",
    comingSoon: true,
  },
];

const cardContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

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

export default function Applications() {
  return (
    <section className="w-full overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-['Poppins'] text-[11px] font-semibold uppercase tracking-[8px] text-[#ff6b2c]"
        >
          Applications
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-5 font-['Bebas_Neue'] text-[44px] uppercase leading-none tracking-wide text-[#111] sm:text-[58px] md:text-[72px]"
        >
          Where Our Structure Works
        </motion.h2>

        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-5 block h-[4px] rounded-full bg-[#ff6b2c]"
        />

        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 place-items-center gap-8 md:grid-cols-3 lg:gap-16"
        >
          {applications.map((item) => (
            <motion.div
              key={item.title}
              variants={cardAnimation}
              whileHover={{
                y: -10,
                scale: 1.03,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              }}
              className="group min-h-[360px] w-full max-w-[320px] overflow-hidden rounded-[12px] bg-white p-6 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
            >
              <div className="relative h-[170px] w-full overflow-hidden rounded-[8px] bg-[#f7f7f7]">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className={`pointer-events-none h-full w-full object-cover ${
                    item.comingSoon ? "blur-[2px] brightness-[0.75]" : ""
                  }`}
                  whileHover={{
                    scale: 1.08,
                    transition: {
                      duration: 0.25,
                    },
                  }}
                />

                {item.comingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h4
                      className="font-['Bebas_Neue'] text-[42px] leading-none tracking-wide text-[#ff6b2c] drop-shadow-sm sm:text-[46px]"
                      style={{
                        WebkitTextStroke: "0.8px white",
                      }}
                    >
                      Coming Soon..
                    </h4>
                  </div>
                )}
              </div>

              <h3 className="mt-6 font-['DM_Serif_Display'] text-[21px] leading-tight text-[#111827]">
                {item.title}
              </h3>

              <p className="mt-3 font-['Poppins'] text-[13px] leading-[1.65] text-[#5d6b7a]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
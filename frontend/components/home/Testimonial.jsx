"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "David Smith",
    role: "Finance",
    feedback:
      "Drops nisl aliquet congue tellus nascetur lectus sapien mattis arcu dictum augue volutpat felis etiam suspendisse rhoncus mauris dignissim ante",
  },
  {
    id: 2,
    name: "Beckett Hayden",
    role: "IT Specialist",
    feedback:
      "Working with us as our IT Specialist has been a game-changer. Their deep technical knowledge, quick problem-solving skills, and proactive.",
  },
  {
    id: 3,
    name: "Julian Wyau",
    role: "Marketer",
    feedback:
      "I can't recommend The Gourmet Haven enough. It's a place for special occasions, date nights, or whenever you're in the mood for a culinary adventure.",
  },
];

const Testimonial = () => {
  return (
    <section className="w-full bg-white py-16 md:py-20 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-5">
        {/* Small heading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-['Poppins'] text-[10px] font-semibold tracking-[6px] uppercase text-[#ff6b2c]"
        >
          Our Testimonial
        </motion.p>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-['Bebas_Neue'] mt-5 text-[42px] sm:text-[56px] md:text-[70px] leading-none tracking-wide text-[#111] uppercase"
        >
          What Our Client Feedback
        </motion.h2>

        {/* Orange underline */}
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="block h-[4px] bg-[#ff6b2c] rounded-full mt-5"
        ></motion.span>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-10">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
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
              className="
                group
                bg-white
                border
                border-[#eeeeee]
                rounded-[12px]
                px-7
                pt-7
                pb-7
                shadow-[0_8px_16px_rgba(0,0,0,0.16)]
                transition-all
                duration-300
                hover:border-[#ff9b6a]
                hover:shadow-[0_14px_30px_rgba(255,107,44,0.18)]
              "
            >
              {/* Top: Name + Stars */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-['DM_Serif_Display'] text-[18px] leading-none text-[#111]">
                    {item.name}
                  </h3>

                  <p className="font-['Poppins'] mt-2 text-[12px] text-[#777]">
                    {item.role}
                  </p>
                </div>

                <div className="flex items-center gap-[2px] pt-1">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={14}
                      className="fill-[#ff6b2c] text-[#ff6b2c]"
                    />
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <p className="font-['Poppins'] mt-7 text-[13px] leading-[1.9] text-[#666]">
                "{item.feedback}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
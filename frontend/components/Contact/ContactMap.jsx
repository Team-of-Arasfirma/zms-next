"use client";

import { motion } from "framer-motion";

const ContactMap = () => {
  const mapUrl =
    "https://www.google.com/maps?q=Zaron%20Metal%20Sections%20India%20Private%20Limited%205%2F114%2F1%20Avinashilingampalayam%20Palangarai%20Avinashi%20Tirupur%20Tamil%20Nadu%20641654&output=embed";

  const directionUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Zaron%20Metal%20Sections%20India%20Private%20Limited%205%2F114%2F1%20Avinashilingampalayam%20Palangarai%20Avinashi%20Tirupur%20Tamil%20Nadu%20641654";

  return (
    <section className="relative bg-white py-16 md:py-24">
      {/* Background Shape */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,107,44,0.10),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(29,43,58,0.08),transparent_35%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Our Location
          </p>

          <h2 className="mt-3 font-['Bebas_Neue'] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Find Us On Map
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-[Lato] text-base leading-7 text-gray-600">
            Visit Zaron Metal Sections India Private Limited for steel structure,
            purlin, and fabrication solutions.
          </p>
        </div>

        {/* Map Layout */}
        <div className="grid overflow-hidden rounded-[30px] bg-[#f7f7f7] shadow-[0_18px_60px_rgba(29,43,58,0.14)] lg:grid-cols-[0.9fr_1.6fr]">
          {/* Left Content Card */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center bg-[#1d2b3a] p-8 text-white sm:p-10"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b2c]">
              <span className="font-['Bebas_Neue'] text-3xl">Z</span>
            </div>

            <h3 className="font-['DM_Serif_Display'] text-3xl">
              Zaron Metal Sections
            </h3>

            <p className="mt-4 font-[Poppins] text-sm leading-7 text-white/75">
              5/114/1, Avinashilingampalayam, Palangarai, Avinashi Taluk,
              Avinashi, Tirupur, Tamil Nadu - 641654
            </p>

            <div className="mt-7 space-y-3 font-[Poppins] text-sm text-white/85">
              <p>
                <span className="font-semibold text-[#ff6b2c]">Phone:</span>{" "}
                +91 96559 66676
              </p>

              <p>
                <span className="font-semibold text-[#ff6b2c]">Email:</span>{" "}
                sales@zmsipl.com
              </p>
            </div>

            <a
              href={directionUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#1d2b3a]"
            >
              Get Direction →
            </a>
          </motion.div>

          {/* Google Map */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="h-[380px] w-full lg:h-[520px]"
          >
            <iframe
              title="Zaron Metal Sections Location"
              src={mapUrl}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
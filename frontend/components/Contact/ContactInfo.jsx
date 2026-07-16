"use client";

import { motion } from "framer-motion";

const LocationIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19 19.5 19.5 0 0 1 5 12.81 19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.57 2.5a2 2 0 0 1-.45 2.11L7.9 9.61a16 16 0 0 0 6.49 6.49l1.28-1.28a2 2 0 0 1 2.11-.45c.8.25 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const contactInfo = [
  {
    title: "Office Address",
    value:
      "Zaron Metal Sections India Private Limited, 5/114/1, Avinashilingampalayam, Palangarai, Avinashi Taluk, Avinashi, Tirupur, Tamil Nadu - 641654",
    icon: <LocationIcon />,
    link: "https://www.google.com/maps?q=Zaron%20Metal%20Sections%20India%20Private%20Limited%205%2F114%2F1%20Avinashilingampalayam%20Palangarai%20Avinashi%20Tirupur%20Tamil%20Nadu%20641654",
  },
  {
    title: "Phone Number",
    value: ["+91 96559 66676", "+91 90923 66676 "],
    icon: <PhoneIcon />,
    link: "tel:+919655966676",
  },
  {
    title: "Email Address",
    value: ["sales@zmsipl.com", "marketing@zmsipl.com"],
    icon: <MailIcon />,
    link: "mailto:sales@zmsipl.com",
  },
];

const ContactInfo = () => {
  return (
    <section className="bg-[#f7f7f7] py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Contact Details
          </p>

          <h2 className="mt-3 font-['Bebas_Neue'] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Reach Us Anytime
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contactInfo.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              target={item.title === "Office Address" ? "_blank" : "_self"}
              rel={item.title === "Office Address" ? "noreferrer" : undefined}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group rounded-[22px] bg-white p-7 text-center shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b2c]/10 text-[#ff6b2c] transition-all duration-300 group-hover:bg-[#ff6b2c] group-hover:text-white">
                {item.icon}
              </div>

              <h3 className="font-['DM_Serif_Display'] text-2xl text-[#1d2b3a]">
                {item.title}
              </h3>

              <div className="mx-auto mt-3 max-w-[320px] font-[Poppins] text-sm leading-7 text-gray-600">
                {Array.isArray(item.value) ? (
                  item.value.map((value, i) => (
                    <p key={i}>{value}</p>
                  ))
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function PrestigiousClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/clients`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load clients");
        }

        const activeClients = Array.isArray(data)
          ? data
              .filter((client) => client.status === "Active")
              .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          : [];

        setClients(activeClients);
      } catch (error) {
        console.error("Fetch Clients Error:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const scrollingClients = [...clients, ...clients];

  const normalizeImageSrc = (src) => {
    if (!src) return "";

    if (/^(https?:|data:|blob:|\/)/.test(src)) {
      return src;
    }

    return `/${src}`;
  };

  const renderClientLogo = (client, index, rowType) => {
    const logo = normalizeImageSrc(client.logo);

    return (
      <div
        key={`${rowType}-${client._id || client.clientName || "client"}-${index}`}
        className="group flex h-[110px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.08)] sm:h-[125px] sm:w-[225px] md:h-[135px] md:w-[240px]"
      >
        {logo ? (
          <div className="relative h-[80px] w-[155px] sm:h-[88px] sm:w-[170px] md:h-[95px] md:w-[185px]">
            <Image
              src={logo}
              alt={client.clientName || "Client Logo"}
              fill
              sizes="(max-width: 640px) 155px, (max-width: 768px) 170px, 185px"
              loading="lazy"
              quality={70}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : null}
      </div>
    );
  };

  if (!loading && clients.length === 0) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden bg-[#f2f2f2] py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-5">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-['Poppins'] text-[10px] font-semibold uppercase tracking-[6px] text-[#ff6b2c]"
        >
          Trusted Partners
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-5 font-['Bebas_Neue'] text-[42px] uppercase leading-none tracking-wide text-[#111] sm:text-[56px] md:text-[70px]"
        >
          Our Prestigious Clients
        </motion.h2>

        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-5 block h-[4px] rounded-full bg-[#ff6b2c]"
        />

        {loading && (
          <p className="mt-10 font-['Poppins'] text-sm text-gray-500">
            Loading clients...
          </p>
        )}

        {!loading && clients.length > 0 && (
          <div className="mt-12 space-y-6">
            {/* Top row: left to right */}
            <div className="client-row-wrapper relative overflow-hidden">
              <div className="client-scroll-left-to-right flex w-max gap-6">
                {scrollingClients.map((client, index) =>
                  renderClientLogo(client, index, "top")
                )}
              </div>
            </div>

            {/* Bottom row: right to left */}
            <div className="client-row-wrapper relative overflow-hidden">
              <div className="client-scroll-right-to-left flex w-max gap-6">
                {scrollingClients.map((client, index) =>
                  renderClientLogo(client, index, "bottom")
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
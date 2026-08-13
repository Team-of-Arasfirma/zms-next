"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const products = [
  {
    image: "/assets/product-image/cPurlin.png",
    title: "C Purlin",
    description:
      "Structural C-section steel for rafters, floor joists, and wall studs with high tensile strength.",
  },
  {
    image: "/assets/product-image/hatPurlin.png",
    title: "Hat Purlin",
    description:
      "Hat-section purlins providing excellent strength-to-weight ratio for modern roofing systems.",
  },
  {
    image: "/assets/product-image/hrHdgPurlin.png",
    title: "HR | HDG Purlin",
    description:
      "Hot-rolled structural purlins for heavy-duty industrial applications requiring superior load capacity.",
  },
  {
    image: "/assets/product-image/Cleat.png",
    title: "Cleat",
    description:
      "Precision-made cleats used for strong fixing, support, and secure structural connections.",
  },
  {
    image: "/assets/product-image/Plate.png",
    title: "Plate",
    description:
      "Steel plates used for strong fixing, support, and secure structural connections.",
  },
];

export default function ProductPreview() {
  return (
    <section className="w-full bg-[#f7f7f7] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Our Products
          </p>

          <h2 className="mt-3 font-[Bebas_Neue] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Precision Engineered Steel Products
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-[Lato] text-base leading-7 text-gray-600">
            Explore our range of purlins, cleats, and plates built for solar
            mounting structures and industrial fabrication projects.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          {products.map((product, index) => (
            <motion.article
              key={product.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-[22px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)]"
            >
              <div className="relative h-[210px] overflow-hidden bg-[#f3f3f3]">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 20vw"
                  loading="lazy"
                  quality={70}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-5">
                <h3 className="font-['DM_Serif_Display'] text-[24px] leading-tight text-[#1d2b3a] transition-colors duration-300 group-hover:text-[#ff6b2c]">
                  {product.title}
                </h3>

                <p className="mt-3 font-[Poppins] text-sm leading-6 text-gray-600">
                  {product.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/product"
            className="inline-flex items-center rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

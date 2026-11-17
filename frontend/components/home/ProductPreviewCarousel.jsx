"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CatalogueImage from "@/components/Product/CatalogueImage";
import { categoryPath } from "@/lib/productCatalogue";

export default function ProductPreviewCarousel({ categories, unavailable = false }) {
  const viewport = useRef(null);
  const carouselId = useId();
  const reducedMotion = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let frame;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const start = element.scrollLeft <= 1;
        const end = element.scrollWidth - element.clientWidth - element.scrollLeft <= 1;
        setEdges((previous) => previous.start === start && previous.end === end
          ? previous : { start, end });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const card of element.children) observer.observe(card);
    element.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, [categories]);

  const scrollToCard = (direction) => {
    const element = viewport.current;
    if (!element?.firstElementChild) return;
    const cards = Array.from(element.children);
    const origin = cards[0].offsetLeft;
    const step = cards[1] ? cards[1].offsetLeft - origin : cards[0].offsetWidth;
    const current = Math.round(element.scrollLeft / step);
    const target = Math.max(0, Math.min(cards.length - 1, current + direction));
    element.scrollTo({ left: cards[target].offsetLeft - origin, behavior: reducedMotion ? "instant" : "smooth" });
  };

  const handleKeys = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      scrollToCard(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      viewport.current.scrollTo({ left: event.key === "Home" ? 0 : viewport.current.scrollWidth, behavior: reducedMotion ? "instant" : "smooth" });
    }
  };

  if (unavailable || categories.length === 0) {
    return (
      <p role="status" className="rounded-[22px] bg-white p-8 text-center font-[Poppins] text-sm leading-6 text-gray-600">
        {unavailable ? "Product categories are temporarily unavailable. Please try again later." : "No product categories are available yet."}
      </p>
    );
  }

  const controlClass = "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1d2b3a] shadow-sm transition hover:bg-[#ff6b2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b2c] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1d2b3a]";

  return (
    <div role="region" aria-label="Product categories" aria-roledescription="carousel" className="min-w-0">
      <div className="mb-4 flex justify-end gap-3" hidden={edges.start && edges.end}>
        <button type="button" aria-label="Previous product category" aria-controls={carouselId} disabled={edges.start} onClick={() => scrollToCard(-1)} className={controlClass}>
          <ChevronLeft aria-hidden="true" size={22} />
        </button>
        <button type="button" aria-label="Next product category" aria-controls={carouselId} disabled={edges.end} onClick={() => scrollToCard(1)} className={controlClass}>
          <ChevronRight aria-hidden="true" size={22} />
        </button>
      </div>
      <div
        id={carouselId}
        ref={viewport}
        tabIndex={0}
        aria-label="Scroll product categories using arrow keys"
        onKeyDown={handleKeys}
        className="relative -my-3 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto overscroll-x-contain py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b2c] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => (
          <motion.article
            key={category._id}
            initial={reducedMotion ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : Math.min(index, 4) * 0.08 }}
            viewport={{ once: true }}
            className="group flex min-w-0 shrink-0 basis-full snap-start overflow-hidden rounded-[22px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)] motion-reduce:transform-none motion-reduce:transition-none sm:basis-[calc((100%-24px)/2)] xl:basis-[calc((100%-48px)/3)]"
          >
            <Link href={categoryPath(category)} className="flex w-full min-w-0 flex-col rounded-[22px] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#ff6b2c]">
              <div className="relative h-[210px] shrink-0 overflow-hidden bg-[#f3f3f3] [&_img]:transition-transform [&_img]:duration-500 motion-safe:group-hover:[&_img]:scale-110">
                <CatalogueImage src={category.image} alt={category.name} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </div>
              <div className="flex flex-1 flex-col break-words p-5">
                <h3 className="font-['DM_Serif_Display'] text-[24px] leading-tight text-[#1d2b3a] transition-colors duration-300 group-hover:text-[#ff6b2c]">{category.name}</h3>
                <p className="mt-3 whitespace-pre-line font-[Poppins] text-sm leading-6 text-gray-600">{category.description}</p>
                <span className="mt-auto pt-4 font-[Poppins] text-sm font-semibold text-[#ff6b2c]">Explore Category →</span>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

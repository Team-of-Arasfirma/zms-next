"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import QuotePopup from "@/components/QuotePopup";

const slides = [
  {
    src: "/hero-image/h1.jpg",
    alt: "ZMS construction structure 1",
  },
  {
    src: "/hero-image/h2.jpg",
    alt: "ZMS construction structure 2",
  },
  {
    src: "/hero-image/h3.jpg",
    alt: "ZMS construction structure 3",
  },
  {
    src: "/hero-image/h4.jpg",
    alt: "ZMS construction structure 4",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((previousSlide) => {
        return (previousSlide + 1) % slides.length;
      });
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <section className="relative min-h-[82vh] w-full overflow-hidden">
        {/* Background slider images */}
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              currentSlide === index
                ? "scale-100 opacity-100"
                : "scale-110 opacity-0"
            }`}
            aria-hidden={currentSlide !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              quality={75}
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl animate-[fadeUp_1s_ease-out] text-left">
            <p className="mb-4 font-['Bebas_Neue'] text-sm font-semibold uppercase tracking-[4px] text-orange-500">
              ZMS Structure Solutions
            </p>

            <h1 className="font-['Bebas_Neue'] uppercase leading-[1.12] tracking-tight text-white">
              <span className="block text-4xl sm:text-5xl md:text-5xl lg:text-[60px]">
                Precision Structure
              </span>

              <span className="block text-4xl sm:text-5xl md:text-5xl lg:text-[60px]">
                Solutions For
              </span>

              <span className="block text-4xl text-orange-500 sm:text-5xl md:text-6xl lg:text-[62px]">
                Modern Construction
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-gray-200 sm:text-base">
              Industry-leading manufacturer of C purlin, HR purlin, hat purlin,
              and solar module mounting structures, engineered for strength and
              durability.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsQuoteOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-orange-600"
              >
                <FileText
                  className="h-5 w-5 shrink-0"
                  strokeWidth={2.4}
                />

                <span>Request A Quote</span>
              </button>

              <a
                href="/ZMS-Catlog.pdf"
                download="ZMS-Catlog.pdf"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-white px-6 py-3.5 text-sm font-bold text-gray-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
              >
                <Download
                  className="h-5 w-5 shrink-0"
                  strokeWidth={2.4}
                />

                <span>Download Brochure</span>
              </a>
            </div>

            {/* Slider dots */}
            <div className="mt-8 flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-9 bg-orange-500"
                      : "w-2.5 bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Popup */}
      <QuotePopup
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
      />
    </>
  );
}

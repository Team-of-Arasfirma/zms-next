"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 30,
    suffix: "",
    label: "High-Capacity\nMachines",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Hour Transport\nService",
  },
  {
    value: 500,
    suffix: "+",
    label: "Skilled\nEmployees",
  },
  {
    value: 1000,
    suffix: "+",
    label: "Megawatts\nCompleted",
  },
  {
    value: 3000,
    suffix: "+MW",
    label: "Per Annum\nCapacity",
  },
];

function CountNumber({ value, suffix, startAnimation }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    let start = 0;
    const duration = 1700;
    const speed = 20;
    const increment = value / (duration / speed);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [startAnimation, value]);

  return (
    <h3 className="font-['Bebas_Neue'] whitespace-nowrap text-[30px] font-extrabold leading-none text-orange-500 md:text-[32px]">
      {count}
      {suffix}
    </h3>
  );
}

function Stats() {
  const sectionRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  // Page refresh-la animation start aagakoodathu.
  // User scroll panna mattum ready aagum.
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(true);
    };

    window.addEventListener("scroll", handleScroll, { once: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User scroll pannathuku apram stats section visible aana animation start.
  useEffect(() => {
    if (!hasScrolled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasScrolled]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-10"
    >
      {/* Left side soft shapes */}
      <div className="pointer-events-none absolute left-[-80px] top-[-40px] h-[210px] w-[420px] rounded-br-full bg-orange-50/70"></div>
      <div className="pointer-events-none absolute left-[-120px] top-[10px] h-[160px] w-[360px] rounded-full bg-orange-50/50"></div>

      {/* Right side soft shapes */}
      <div className="pointer-events-none absolute right-[-80px] top-[-40px] h-[210px] w-[420px] rounded-bl-full bg-orange-50/70"></div>
      <div className="pointer-events-none absolute right-[-120px] top-[10px] h-[160px] w-[360px] rounded-full bg-orange-50/50"></div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-4">
        {/* Outer box */}
        <div className="rounded-xl border-2 border-orange-500 bg-white px-5 py-4 shadow-[0_4px_10px_rgba(249,115,22,0.35)] sm:px-7">
          {/* Mobile one by one, desktop same 180px boxes */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:flex-wrap lg:flex-nowrap">
            {stats.map((item, index) => (
              <div
                key={index}
                className="flex min-h-[118px] w-[180px] flex-col items-center justify-center rounded-md bg-orange-50/60 px-3 py-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <CountNumber
                  value={item.value}
                  suffix={item.suffix}
                  startAnimation={startAnimation}
                />

                <p className="mt-5 whitespace-pre-line text-[14px] font-medium leading-6 text-orange-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
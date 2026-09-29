"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const PROJECTS_PER_SLIDE = 3;

export default function LatestProjects() {
  const [projects, setProjects] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const getProjectImage = (project) => {
    return (
      project.image ||
      project.projectImage ||
      project.photo ||
      project.thumbnail ||
      ""
    );
  };

  const normalizeImageSrc = (src) => {
    if (!src) {
      return "";
    }

    if (/^(https?:|data:|blob:|\/)/.test(src)) {
      return src;
    }

    return `/${src}`;
  };

  const getProjectMw = (project) => {
    const directMw = Number(project?.capacityMw);

    if (!Number.isNaN(directMw)) {
      return directMw;
    }

    const capacityText = String(project?.capacity || "");
    const extractedMw = capacityText.match(/[\d.]+/);
    const fallbackMw = extractedMw ? Number(extractedMw[0]) : 0;

    return Number.isNaN(fallbackMw) ? 0 : fallbackMw;
  };

  const projectSlides = useMemo(() => {
    const slides = [];

    for (let index = 0; index < projects.length; index += PROJECTS_PER_SLIDE) {
      slides.push(projects.slice(index, index + PROJECTS_PER_SLIDE));
    }

    return slides;
  }, [projects]);

  const totalSlides = projectSlides.length;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/projects`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load projects");
        }

        const sortedProjects = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const mwDifference = getProjectMw(b) - getProjectMw(a);

              if (mwDifference !== 0) {
                return mwDifference;
              }

              return (
                new Date(b.createdAt || b.uploadedAt || 0) -
                new Date(a.createdAt || a.uploadedAt || 0)
              );
            })
          : [];

        setProjects(sortedProjects);
        setCurrentSlide(0);
      } catch (error) {
        console.error("Fetch Latest Projects Error:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handlePrevious = () => {
    if (totalSlides <= 1) {
      return;
    }

    setCurrentSlide((current) => {
      if (current === 0) {
        return totalSlides - 1;
      }

      return current - 1;
    });
  };

  const handleNext = () => {
    if (totalSlides <= 1) {
      return;
    }

    setCurrentSlide((current) => {
      if (current === totalSlides - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  return (
    <section className="w-full overflow-hidden bg-[#f2f2f2] py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="font-['Poppins'] text-[10px] font-semibold uppercase tracking-[8px] text-[#ff6b2c]"
            >
              Latest Project
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-5 font-['Bebas_Neue'] text-[42px] uppercase leading-none tracking-wide text-[#111] sm:text-[56px] md:text-[70px]"
            >
              Delivering Excellence Across India
            </motion.h2>

            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-5 block h-[4px] rounded-full bg-[#ff6b2c]"
            />
          </div>

          {!loading && totalSlides > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ff6b2c] bg-white text-[#ff6b2c] transition hover:bg-[#ff6b2c] hover:text-white"
                aria-label="Previous projects"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ff6b2c] bg-[#ff6b2c] text-white transition hover:border-[#1d2b3a] hover:bg-[#1d2b3a]"
                aria-label="Next projects"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {loading && (
          <p className="mt-10 font-['Poppins'] text-sm text-gray-500">
            Loading latest projects...
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p className="mt-10 font-['Poppins'] text-sm text-gray-500">
            No projects found.
          </p>
        )}

        {!loading && projectSlides.length > 0 && (
          <div className="mt-10 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {projectSlides.map((slideProjects, slideIndex) => (
                <div
                  key={slideIndex}
                  className="min-w-full shrink-0"
                >
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
                    {slideProjects.map((project, index) => {
                      const projectImage = normalizeImageSrc(
                        getProjectImage(project)
                      );

                      return (
                        <motion.div
                          key={project._id || `${slideIndex}-${index}`}
                          initial={{ opacity: 0, y: 25 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.45,
                            delay: index * 0.08,
                          }}
                          viewport={{ once: true }}
                          whileHover={{
                            y: -8,
                            transition: {
                              duration: 0.15,
                              ease: "easeOut",
                            },
                          }}
                          className="group overflow-hidden rounded-[12px] border border-[#ff9b6a] bg-white p-3 shadow-[0_10px_22px_rgba(0,0,0,0.10)]"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-white">
                            {projectImage ? (
                              <Image
                                src={projectImage}
                                alt={
                                  project.title ||
                                  project.projectName ||
                                  "Project"
                                }
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                loading="lazy"
                                quality={70}
                                className="object-cover object-center transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100 font-['Poppins'] text-sm text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="p-2">
                            <h3 className="mt-3 font-['Poppins'] text-[18px] font-semibold leading-snug text-[#111]">
                              {project.title ||
                                project.projectName ||
                                "Project"}
                            </h3>

                            {project.capacity && (
                              <p className="mt-2 font-['Bebas_Neue'] text-[34px] leading-none tracking-wide text-[#1d2b3a]">
                                {project.capacity}
                              </p>
                            )}

                            {project.location && (
                              <div className="mt-3 flex items-start gap-2 font-['Poppins'] text-[14px] font-medium leading-relaxed text-gray-600">
                                <MapPin
                                  size={17}
                                  className="mt-[2px] shrink-0 text-[#ff6b2c]"
                                />
                                <span>{project.location}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && totalSlides > 1 && (
          <div className="mt-7 flex justify-center gap-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-8 bg-[#ff6b2c]"
                    : "w-2.5 bg-gray-300 hover:bg-[#ff6b2c]/60"
                }`}
                aria-label={`Go to project slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/project"
            className="group inline-flex items-center gap-3 font-['Poppins'] text-[13px] font-semibold text-[#ff6b2c]"
          >
            View All Projects
            <ArrowRight
              size={22}
              className="transition-transform duration-200 group-hover:translate-x-2"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
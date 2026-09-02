﻿"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const PROJECTS_PER_PAGE = 6;

// Legacy helper kept in case older uploads ever use relative paths again.
const resolveImageSrc = (image) => {
  if (!image) {
    return "";
  }

  if (/^(https?:|data:|blob:|\/)/.test(image)) {
    return image;
  }

  return `/${image}`;
};

function ProjectList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load projects from the API so the public page always shows saved uploads.
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/projects`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load projects");
        }

        // The backend already returns the newest projects first.
        setProjects(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    window.scrollTo({
      top: 420,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 font-[Lato] text-sm uppercase tracking-[4px] text-[#ff6b2c]">
            Project Portfolio
          </p>

          <h2 className="font-[Bebas_Neue] text-[48px] leading-none tracking-wide text-[#1d2b3a] md:text-[72px]">
            Our Completed Projects
          </h2>

          <p className="mt-4 font-[Lato] text-base leading-relaxed text-gray-600 md:text-lg">
            We deliver reliable structural solutions with strong fabrication quality, professional execution, and timely project completion.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-[Poppins] text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[22px] border border-gray-200 bg-white px-6 py-16 text-center font-[Poppins] text-sm text-gray-500 shadow-sm">
            Loading projects...
          </div>
        ) : currentProjects.length === 0 ? (
          <div className="rounded-[22px] border border-gray-200 bg-white px-6 py-16 text-center font-[Poppins] text-sm text-gray-500 shadow-sm">
            No projects available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {currentProjects.map((project) => {
              const imageSrc = resolveImageSrc(project.image);

              return (
                <div
                  key={project._id}
                  className="group overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:shadow-xl"
                >
                  <div className="relative h-[280px] overflow-hidden">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        quality={70}
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : null}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <span
                      className={`absolute left-5 top-5 rounded-full px-4 py-2 font-[Poppins] text-xs text-white ${project.status === "Completed"
                        ? "bg-[#ff6b2c]"
                        : "bg-[#1d2b3a]"
                        }`}
                    >
                      {project.status}
                    </span>

                    <h3 className="absolute bottom-5 left-5 font-[Bebas_Neue] text-[42px] leading-none tracking-wide text-white">
                      {project.title}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="mb-1 font-[Poppins] text-sm text-gray-500">
                          Capacity
                        </p>

                        <h4 className="font-[Bebas_Neue] text-[42px] leading-none text-[#1d2b3a]">
                          {project.capacity}
                        </h4>
                      </div>

                      <div className="text-right">
                        <p className="mb-1 font-[Poppins] text-sm text-gray-500">
                          Location
                        </p>

                        <h4 className="font-[Poppins] text-base font-semibold text-[#1d2b3a]">
                          {project.location}
                        </h4>
                      </div>
                    </div>

                    <div className="mb-5 h-px w-full bg-gray-200" />

                    <p className="font-[Lato] text-[15px] leading-relaxed text-gray-600">
                      High-quality industrial structural project completed with precision engineering, durable materials, and strong execution standards.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`rounded-full px-5 py-3 font-[Poppins] text-sm font-semibold transition-all duration-300 ${currentPage === 1
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-[#1d2b3a] text-white hover:bg-[#ff6b2c]"
                }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`h-11 w-11 rounded-full font-[Poppins] text-sm font-semibold transition-all duration-300 ${currentPage === index + 1
                  ? "bg-[#ff6b2c] text-white"
                  : "border border-gray-300 bg-white text-[#1d2b3a] hover:bg-[#1d2b3a] hover:text-white"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`rounded-full px-5 py-3 font-[Poppins] text-sm font-semibold transition-all duration-300 ${currentPage === totalPages
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-[#1d2b3a] text-white hover:bg-[#ff6b2c]"
                }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectList;
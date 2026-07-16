"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function LatestProjects() {
  const [projects, setProjects] = useState([]);
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE}/api/projects`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load projects");
        }

        const latestProjects = Array.isArray(data)
          ? [...data]
              .sort(
                (a, b) =>
                  new Date(b.createdAt || b.uploadedAt || 0) -
                  new Date(a.createdAt || a.uploadedAt || 0)
              )
              .slice(0, 3)
          : [];

        setProjects(latestProjects);
      } catch (error) {
        console.error("Fetch Latest Projects Error:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="w-full overflow-hidden bg-[#f2f2f2] py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-5">
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

        {!loading && projects.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project._id || index}
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
                className="group overflow-hidden rounded-[12px] border border-[#ff9b6a] bg-white p-3 shadow-[0_10px_22px_rgba(0,0,0,0.10)]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-white">
                  {getProjectImage(project) ? (
                    <img
                      src={getProjectImage(project)}
                      alt={project.title || project.projectName || "Project"}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 font-['Poppins'] text-sm text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                <h3 className="mt-4 font-['Poppins'] text-[18px] font-medium text-[#111]">
                  {project.title || project.projectName || "Project"}
                  {project.capacity ? ` - ${project.capacity}` : ""}
                </h3>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/project"
            className="group inline-flex items-center gap-4 font-['Poppins'] text-[13px] font-semibold text-[#ff6b2c]"
          >
            View All Projects

            <span className="text-[24px] leading-none transition-transform duration-200 group-hover:translate-x-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
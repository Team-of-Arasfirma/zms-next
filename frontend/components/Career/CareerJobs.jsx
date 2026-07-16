"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const CareerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch active jobs from the backend.
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/careers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load jobs");
      }

      const activeJobs = Array.isArray(data)
        ? data.filter((job) => job.status === "Active")
        : [];

      setJobs(activeJobs);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Display salary with INR symbol.
  const formatSalary = (salary) => {
    if (!salary) return "-";

    const cleanSalary = salary.trim();

    if (cleanSalary.startsWith("₹")) {
      return cleanSalary;
    }

    return `₹ ${cleanSalary}`;
  };

  // Display date in Indian format.
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Display experience clearly.
  const formatExperience = (experience) => {
    if (!experience) return "-";

    const cleanExperience = String(experience).trim();

    if (cleanExperience.toLowerCase().includes("year")) {
      return cleanExperience;
    }

    if (cleanExperience === "1") {
      return "1 Year";
    }

    return `${cleanExperience} Years`;
  };

  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[4px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Open Positions
          </p>

          <h2
            className="text-[38px] leading-none text-[#1d2b3a] sm:text-[48px] lg:text-[56px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            CURRENT JOB OPENINGS
          </h2>

          <p
            className="mx-auto mt-4 max-w-[680px] text-[15px] leading-8 text-gray-600"
            style={{ fontFamily: "Lato, sans-serif" }}
          >
            Explore available opportunities and apply for a role that matches
            your skills and experience.
          </p>
        </div>

        {loading && (
          <p className="text-center font-[Poppins] text-sm text-gray-500">
            Loading jobs...
          </p>
        )}

        {error && (
          <p className="text-center font-[Poppins] text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-12 text-center">
            <h3
              className="text-[30px] text-[#1d2b3a]"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              No Open Positions
            </h3>

            <p className="mt-3 font-[Poppins] text-sm text-gray-500">
              Currently there are no active job openings. Please check back
              later.
            </p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.07)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)]"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange-50 px-3 py-1 font-[Poppins] text-xs font-bold text-[#ff6b2c]">
                    {job.jobType || "Full Time"}
                  </span>

                  {job.openPositions && (
                    <span className="rounded-full bg-green-50 px-3 py-1 font-[Poppins] text-xs font-bold text-green-700">
                      {job.openPositions} Openings
                    </span>
                  )}
                </div>

                <h3
                  className="text-[30px] leading-none text-[#1d2b3a]"
                  style={{ fontFamily: "DM Serif Display, serif" }}
                >
                  {job.jobTitle}
                </h3>

                <div className="mt-4 grid gap-3 font-[Poppins] text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-bold text-[#1d2b3a]">
                      Department:
                    </span>{" "}
                    {job.department}
                  </p>

                  <p>
                    <span className="font-bold text-[#1d2b3a]">Location:</span>{" "}
                    {job.location}
                  </p>

                  <p>
                    <span className="font-bold text-[#1d2b3a]">
                      Experience:
                    </span>{" "}
                    {formatExperience(job.experience)}
                  </p>

                  {job.salary && (
                    <p>
                      <span className="font-bold text-[#1d2b3a]">Salary:</span>{" "}
                      {formatSalary(job.salary)}
                    </p>
                  )}

                  {job.openPositions && (
                    <p>
                      <span className="font-bold text-[#1d2b3a]">
                        Open Positions:
                      </span>{" "}
                      {job.openPositions}
                    </p>
                  )}

                  <p>
                    <span className="font-bold text-[#1d2b3a]">
                      Job Open Date:
                    </span>{" "}
                    {formatDate(job.jobOpenDate)}
                  </p>

                  <p>
                    <span className="font-bold text-[#1d2b3a]">
                      Job Closing Date:
                    </span>{" "}
                    {formatDate(job.jobCloseDate)}
                  </p>
                </div>

                {/* Job description from Jodit editor */}
                <div
                  className="mt-5 line-clamp-4 font-[Lato] text-[15px] leading-8 text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: job.description || "",
                  }}
                />

                <a
                  href={`/career/apply/${job._id}`}
                  className="mt-6 inline-flex rounded-md bg-[#ff6b2c] px-5 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
                >
                  Apply Now
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CareerJobs;
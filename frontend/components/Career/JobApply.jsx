"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const JobApply = ({ jobId }) => {
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    portfolioUrl: "",
    linkedinUrl: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch selected job details from careers API.
  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/careers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load job details");
      }

      const selectedJob = Array.isArray(data)
        ? data.find((career) => career._id === jobId)
        : null;

      if (!selectedJob) {
        throw new Error("Job not found");
      }

      setJob(selectedJob);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  // Update form input values.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // Store selected resume file.
  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  // Display salary with INR symbol.
  const formatSalary = (salary) => {
    if (!salary) return "-";

    const cleanSalary = salary.trim();

    if (cleanSalary.startsWith("₹")) {
      return cleanSalary;
    }

    return `₹ ${cleanSalary}`;
  };

  // Submit application form to backend.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.experience.trim() ||
      !resumeFile
    ) {
      setError("Name, email, phone, experience, and resume are required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("jobId", job?._id || "");
      payload.append("jobTitle", job?.jobTitle || "");
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("experience", formData.experience);
      payload.append("portfolioUrl", formData.portfolioUrl);
      payload.append("linkedinUrl", formData.linkedinUrl);
      payload.append("coverLetter", formData.coverLetter);
      payload.append("resume", resumeFile);

      const response = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit application");
      }

      setMessage(data?.message || "Application submitted successfully.");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        experience: "",
        portfolioUrl: "",
        linkedinUrl: "",
        coverLetter: "",
      });
      setResumeFile(null);

      setTimeout(() => {
        router.push("/career");
      }, 1200);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-white py-20">
        <p className="text-center font-[Poppins] text-sm text-gray-500">
          Loading job details...
        </p>
      </section>
    );
  }

  if (error && !job) {
    return (
      <section className="min-h-[70vh] bg-white py-20">
        <div className="mx-auto max-w-[720px] px-6 text-center">
          <p className="font-[Poppins] text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => router.push("/career")}
            className="mt-5 rounded-md bg-[#ff6b2c] px-5 py-3 font-[Poppins] text-sm font-semibold text-white"
          >
            Back to Careers
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f7f7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        {/* Page Heading */}
        <motion.div
          className="mb-10 text-center"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[4px] text-[#ff6b2c]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Job Application
          </p>

          <h1
            className="text-[42px] leading-none text-[#1d2b3a] sm:text-[56px]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            Apply For This Position
          </h1>

          <p className="mt-4 font-[Poppins] text-sm font-semibold text-gray-600">
            Position: <span className="text-[#ff6b2c]">{job?.jobTitle}</span>
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Left Side Job Details */}
          <motion.aside
            className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8 lg:sticky lg:top-24"
            initial={{ x: -35, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-[#ff6b2c]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Job Details
            </p>

            <h2
              className="text-[34px] leading-none text-[#1d2b3a] sm:text-[42px]"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {job?.jobTitle}
            </h2>

            <div className="mt-6 grid gap-4 font-[Poppins] text-sm text-gray-600">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-bold text-[#1d2b3a]">Department</p>
                <p className="mt-1">{job?.department || "-"}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-bold text-[#1d2b3a]">Location</p>
                <p className="mt-1">{job?.location || "-"}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-bold text-[#1d2b3a]">Job Type</p>
                  <p className="mt-1">{job?.jobType || "Full Time"}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-bold text-[#1d2b3a]">Experience</p>
                  <p className="mt-1">{job?.experience || "-"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-bold text-[#1d2b3a]">Salary</p>
                  <p className="mt-1">{formatSalary(job?.salary)}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-bold text-[#1d2b3a]">Open Positions</p>
                  <p className="mt-1">{job?.openPositions || "-"}</p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="font-[Poppins] text-sm font-bold text-[#1d2b3a]">
                Job Description
              </h3>

              <div
                className="job-description mt-3 font-[Lato] text-[15px] leading-8 text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: job?.description || "",
                }}
              />
            </div>
          </motion.aside>

          {/* Right Side Apply Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8"
            initial={{ x: 35, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2
              className="mb-6 text-[34px] leading-none text-[#1d2b3a]"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              Application Form
            </h2>

            {(message || error) && (
              <div
                className={`mb-5 rounded-lg border px-4 py-3 font-[Poppins] text-sm ${error
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-green-200 bg-green-50 text-green-700"
                  }`}
              >
                {error || message}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
                />
              </div>

              <div>
                <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Example: 2 Years"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
                />
              </div>

              <div>
                <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                Resume <span className="text-red-500">*</span>
              </label>

              <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-5 py-6 text-center transition hover:border-[#ff6b2c]">
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />

                <span className="text-3xl text-gray-400">☁</span>

                <span className="mt-2 font-[Poppins] text-sm font-semibold text-[#ff6b2c]">
                  {resumeFile ? resumeFile.name : "Upload Resume"}
                </span>

                <span className="mt-1 font-[Poppins] text-xs text-gray-400">
                  PDF, DOC, DOCX only
                </span>
              </label>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-[Poppins] text-sm font-bold uppercase tracking-wide text-[#1d2b3a]">
                Cover Letter
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows="6"
                placeholder="Tell us why you are a great fit for this role..."
                className="w-full resize-none rounded-xl border border-gray-200 px-5 py-4 font-[Poppins] text-sm outline-none focus:border-[#ff6b2c]"
              />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/career")}
                className="rounded-full border border-gray-200 px-7 py-3 font-[Poppins] text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default JobApply;
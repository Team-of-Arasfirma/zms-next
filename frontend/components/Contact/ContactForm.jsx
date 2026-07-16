"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const ContactForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(event.target);

    const inquiryData = {
      companyName: formData.get("companyName"),
      inquiryName: formData.get("inquiryName"),
      callNumber: formData.get("callNumber"),
      gstNumber: formData.get("gstNumber"),
      mountType: formData.get("mountType"),
      mw: formData.get("mw"),
      productName: "Contact Page Enquiry",
    };

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/api/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit inquiry");
      }

      setMessage(data?.message || "Inquiry submitted successfully.");
      event.target.reset();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center"
        >
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Send Enquiry
          </p>

          <h2 className="mt-3 font-['Bebas_Neue'] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Let&apos;s Discuss Your Requirement
          </h2>

          <p className="mt-5 font-[Lato] text-base leading-8 text-gray-600">
            Share your project or product requirement with us. Our team will
            review your details and contact you shortly.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-[28px] bg-[#f7f7f7] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8"
        >
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
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              required
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
            />

            <input
              type="text"
              name="inquiryName"
              placeholder="Inquiry Name"
              required
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <input
              type="tel"
              name="callNumber"
              placeholder="Call Number"
              required
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
            />

            <input
              type="text"
              name="gstNumber"
              placeholder="GST Number"
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <select
              name="mountType"
              required
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm text-gray-600 outline-none transition focus:border-[#ff6b2c]"
            >
              <option value="">Select Mount Type</option>
              <option value="Roof Mount">Roof Mount</option>
              <option value="Ground Mount">Ground Mount</option>
              <option value="Custom Structure">Custom Structure</option>
            </select>

            <input
              type="number"
              name="mw"
              placeholder="MW"
              required
              min="0"
              step="0.01"
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#ff6b2c] px-8 py-4 font-[Poppins] text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1d2b3a] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {submitting ? "Submitting..." : "Send Enquiry &rarr;"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactForm;
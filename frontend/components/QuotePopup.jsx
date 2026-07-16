"use client";

import { useState } from "react";
import { X } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const QuotePopup = ({ isOpen, onClose, productName = "" }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const quoteData = {
      companyName: formData.get("companyName"),
      inquiryName: formData.get("inquiryName"),
      callNumber: formData.get("callNumber"),
      gstNumber: formData.get("gstNumber"),
      mountType: formData.get("mountType"),
      mw: formData.get("mw"),
      productName,
    };

    try {
      setSubmitting(true);

      // Send quote form data to the backend API.
      const response = await fetch(`${API_BASE}/api/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to submit quote request"
        );
      }

      setMessage(
        data?.message || "Quote request submitted successfully!"
      );

      form.reset();

      window.setTimeout(() => {
        onClose();
        setMessage("");
      }, 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-orange-500 hover:text-white"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        <h2 className="font-['Bebas_Neue'] text-[34px] uppercase tracking-wide text-gray-900">
          Request A Quote
        </h2>

        <p className="mt-1 font-['Poppins'] text-sm text-gray-500">
          Fill the details below. Our team will contact you soon.
        </p>

        {productName && (
          <p className="mt-3 rounded-lg bg-orange-50 px-4 py-2 font-['Poppins'] text-sm font-semibold text-orange-600">
            Product: {productName}
          </p>
        )}

        {(message || error) && (
          <div
            className={`mt-4 rounded-md border px-4 py-3 font-['Poppins'] text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm outline-none focus:border-orange-500"
          />

          <input
            type="text"
            name="inquiryName"
            placeholder="Inquiry Name"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm outline-none focus:border-orange-500"
          />

          <input
            type="tel"
            name="callNumber"
            placeholder="Call Number"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm outline-none focus:border-orange-500"
          />

          <input
            type="text"
            name="gstNumber"
            placeholder="GST Number"
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm outline-none focus:border-orange-500"
          />

          <select
            name="mountType"
            required
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm text-gray-600 outline-none focus:border-orange-500"
          >
            <option value="" disabled>
              Select Mount Type
            </option>
            <option value="Roof Mount">Roof Mount</option>
            <option value="Ground Mount">Ground Mount</option>
          </select>

          <input
            type="number"
            name="mw"
            placeholder="MW"
            required
            min="0"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-4 py-3 font-['Poppins'] text-sm outline-none focus:border-orange-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-orange-500 py-3 font-['Poppins'] text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Quote Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuotePopup;
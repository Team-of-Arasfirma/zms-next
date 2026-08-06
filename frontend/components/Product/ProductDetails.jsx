"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const initialQuoteForm = {
  companyName: "",
  inquiryName: "",
  callNumber: "",
  gstNumber: "",
  mountType: "",
  mw: "",
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

const ProductDetails = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quoteForm, setQuoteForm] = useState(initialQuoteForm);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteError, setQuoteError] = useState("");

  // Fetch active products from the backend.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load products");
      }

      const activeProducts = Array.isArray(data)
        ? data.filter((product) => product.status === "Active")
        : [];

      setProducts(activeProducts);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open quote popup for the selected product.
  const openQuoteModal = (product) => {
    setSelectedProduct(product);
    setQuoteForm(initialQuoteForm);
    setQuoteMessage("");
    setQuoteError("");
    setIsQuoteModalOpen(true);
  };

  // Close quote popup and reset form.
  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedProduct(null);
    setQuoteForm(initialQuoteForm);
    setQuoteMessage("");
    setQuoteError("");
  };

  // Update quote form fields.
  const handleQuoteChange = (event) => {
    const { name, value } = event.target;

    setQuoteForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Submit quote request to the backend.
  const handleQuoteSubmit = async (event) => {
    event.preventDefault();

    setQuoteMessage("");
    setQuoteError("");

    if (
      !quoteForm.companyName.trim() ||
      !quoteForm.inquiryName.trim() ||
      !quoteForm.callNumber.trim() ||
      !quoteForm.mountType.trim() ||
      !quoteForm.mw.trim()
    ) {
      setQuoteError(
        "Company name, inquiry name, call number, mount type, and MW are required."
      );
      return;
    }

    try {
      setQuoteSubmitting(true);

      const response = await fetch(`${API_BASE}/api/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quoteForm,
          productName: selectedProduct?.name || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit quote request");
      }

      setQuoteMessage(data?.message || "Quote request submitted successfully.");
      setQuoteForm(initialQuoteForm);

      setTimeout(() => {
        closeQuoteModal();
      }, 1200);
    } catch (submitError) {
      setQuoteError(submitError.message);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10 lg:px-20">
          <p className="font-[Poppins] text-sm text-gray-500">
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10 lg:px-20">
          <p className="font-[Poppins] text-sm text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 text-center sm:px-10 lg:px-20">
          <p className="font-[Poppins] text-sm text-gray-500">
            No products available yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
          <div className="space-y-20 lg:space-y-24">
            {products.map((product, index) => {
              const isReverse = index % 2 !== 0;
              const imageSrc = normalizeImageSrc(product.image);

              return (
                <div
                  key={product._id}
                  className={`grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-16 ${isReverse ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                >
                  {/* Product image */}
                  <motion.div
                    className="flex h-full items-center justify-center rounded-[10px] bg-gray-50 p-6"
                    initial={{ x: isReverse ? 50 : -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="relative h-[420px] min-h-[420px] w-full lg:h-[620px] lg:min-h-[620px]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={product.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          loading="lazy"
                          quality={70}
                          className="rounded-[10px] object-contain object-center"
                        />
                      ) : null}
                    </div>
                  </motion.div>

                  {/* Product content */}
                  <motion.div
                    className="flex h-full max-w-[580px] flex-col justify-center"
                    initial={{ x: isReverse ? -50 : 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <h2
                      className="mb-5 text-[32px] leading-none text-[#111111] sm:text-[38px] lg:text-[42px]"
                      style={{ fontFamily: "DM Serif Display, serif" }}
                    >
                      {product.name}
                    </h2>

                    {product.description && (
                      <p
                        className="mb-6 text-[14px] font-medium leading-[1.8] text-[#555555] sm:text-[15px]"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {product.description}
                      </p>
                    )}

                    <p
                      className="mb-4 text-[20px] font-bold uppercase tracking-wide text-[#ff6b2c]"
                      style={{ fontFamily: "Bebas Neue, sans-serif" }}
                    >
                      Specifications
                    </p>

                    {/* Specification table */}
                    <div className="mb-7 overflow-hidden rounded-[10px] border border-gray-200">
                      {product.specifications?.map((spec, specIndex) => (
                        <div
                          key={`${spec.label}-${specIndex}`}
                          className={`grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4 ${specIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                        >
                          <p
                            className="text-[13px] font-semibold text-[#1d2b3a]"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            {spec.label}
                          </p>

                          <p
                            className="text-[13px] font-medium leading-[1.6] text-[#666666]"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => openQuoteModal(product)}
                      className="inline-flex w-fit rounded-[4px] bg-[#ff6b2c] px-5 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-[#e85b1d]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Request Quote
                    </button>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="relative max-h-[92vh] w-full max-w-[540px] overflow-y-auto rounded-[14px] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeQuoteModal}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-orange-500 hover:text-white"
              aria-label="Close popup"
            >
              <X size={20} />
            </button>

            <h2
              className="pr-12 text-[34px] leading-none text-[#1d2b3a]"
              style={{ fontFamily: "Bebas Neue, sans-serif" }}
            >
              Request A Quote
            </h2>

            <p
              className="mt-3 text-[14px] leading-6 text-gray-500"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Fill the details below. Our team will contact you soon.
            </p>

            {selectedProduct?.name && (
              <p className="mt-3 rounded-lg bg-orange-50 px-4 py-2 font-[Poppins] text-sm font-semibold text-[#ff6b2c]">
                Product: {selectedProduct.name}
              </p>
            )}

            {(quoteMessage || quoteError) && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 font-[Poppins] text-sm ${quoteError
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-green-200 bg-green-50 text-green-700"
                  }`}
              >
                {quoteError || quoteMessage}
              </div>
            )}

            <form onSubmit={handleQuoteSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="companyName"
                value={quoteForm.companyName}
                onChange={handleQuoteChange}
                placeholder="Company Name"
                className="w-full rounded-md border border-gray-300 px-4 py-3 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
              />

              <input
                type="text"
                name="inquiryName"
                value={quoteForm.inquiryName}
                onChange={handleQuoteChange}
                placeholder="Inquiry Name"
                className="w-full rounded-md border border-gray-300 px-4 py-3 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
              />

              <input
                type="tel"
                name="callNumber"
                value={quoteForm.callNumber}
                onChange={handleQuoteChange}
                placeholder="Call Number"
                className="w-full rounded-md border border-gray-300 px-4 py-3 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
              />

              <input
                type="text"
                name="gstNumber"
                value={quoteForm.gstNumber}
                onChange={handleQuoteChange}
                placeholder="GST Number"
                className="w-full rounded-md border border-gray-300 px-4 py-3 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
              />

              <select
                name="mountType"
                value={quoteForm.mountType}
                onChange={handleQuoteChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 font-[Poppins] text-sm text-gray-600 outline-none transition focus:border-[#ff6b2c]"
              >
                <option value="">Select Mount Type</option>
                <option value="Rooftop Mount">Rooftop Mount</option>
                <option value="Ground Mount">Ground Mount</option>
                <option value="Carport Mount">Carport Mount</option>
                <option value="Custom Structure">Custom Structure</option>
              </select>

              <input
                type="text"
                name="mw"
                value={quoteForm.mw}
                onChange={handleQuoteChange}
                placeholder="MW"
                className="w-full rounded-md border border-gray-300 px-4 py-3 font-[Poppins] text-sm outline-none transition focus:border-[#ff6b2c]"
              />

              <button
                type="submit"
                disabled={quoteSubmitting}
                className="w-full rounded-md bg-[#ff6b2c] px-5 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#e85b1d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {quoteSubmitting ? "Submitting..." : "Submit Quote Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;

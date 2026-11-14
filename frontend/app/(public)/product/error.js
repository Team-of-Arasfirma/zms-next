"use client";

import Link from "next/link";

export default function ProductError({ reset }) {
  return (
    <section role="alert" className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold text-[#1d2b3a]">Catalogue temporarily unavailable</h1>
      <p className="mt-4 leading-7 text-gray-600">We could not load the catalogue. Please try again, or contact our team for product information.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={reset} className="rounded-md bg-[#ff6b2c] px-5 py-3 font-semibold text-white">Try again</button>
        <Link href="/contact" className="rounded-md border border-gray-300 px-5 py-3 font-semibold">Contact us</Link>
      </div>
    </section>
  );
}
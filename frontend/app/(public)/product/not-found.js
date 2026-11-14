import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold text-[#1d2b3a]">Product or category not found</h1>
      <p className="mt-4 text-gray-600">This item is not available in our published catalogue.</p>
      <Link href="/product" className="mt-6 inline-block rounded-md bg-[#ff6b2c] px-5 py-3 font-semibold text-white">Browse products</Link>
    </section>
  );
}
import Link from "next/link";
import CatalogueImage from "./CatalogueImage";

export default function ProductCards({ products }) {
  if (!products.length) return <p role="status" className="rounded-xl bg-gray-50 p-8 text-gray-600">No published products are available in this category yet.</p>;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product._id} href={product.detailPath} className="group overflow-hidden rounded-xl border border-gray-200 transition hover:border-orange-400 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-orange-500">
          <div className="relative h-64 bg-gray-50"><CatalogueImage src={product.image} alt={product.name} /></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#1d2b3a] group-hover:text-[#ff6b2c]">{product.name}</h2>
            {product.description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description}</p>}
            <span className="mt-4 inline-block text-sm font-semibold text-[#ff6b2c]">View product →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import CatalogueImage from "./CatalogueImage";
import { categoryPath } from "@/lib/productCatalogue";

export default function CategoryCatalogue({ categories = [] }) {
  return (
    <section
      aria-labelledby="category-heading"
      className="bg-white py-12 sm:py-16"
    >
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        {/* SECTION HEADING */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#ff6b2c]">
            Product categories
          </p>

          <h2
            id="category-heading"
            className="mt-2 text-3xl font-semibold text-[#1d2b3a]"
          >
            Explore Our Range
          </h2>
        </div>

        {/* DYNAMIC CATEGORY CARDS */}
        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={categoryPath(category)}
                className="group overflow-hidden rounded-xl border border-gray-200 transition hover:border-orange-400 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                {/* CATEGORY IMAGE */}
                <div className="relative h-56 bg-gray-50">
                  <CatalogueImage
                    src={category.image}
                    alt={category.name}
                  />
                </div>

                {/* CATEGORY DETAILS */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1d2b3a] group-hover:text-[#ff6b2c]">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                      {category.description}
                    </p>
                  )}

                  <span className="mt-4 inline-block text-sm font-semibold text-[#ff6b2c]">
                    Explore products →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Product categories will be available soon.
          </p>
        )}
      </div>
    </section>
  );
}

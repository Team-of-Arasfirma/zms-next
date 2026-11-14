
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCatalogue,
  getPublicCategory,
} from "@/lib/productCatalogue.server";

import {
  categoryId,
  categoryPath,
} from "@/lib/productCatalogue";

import ProductCards from "@/components/Product/ProductCards";
import { productPageMetadata } from "@/lib/productSeo";

// Resolve an active category.
// Missing categories become 404.
// API failures must propagate to the error boundary.
async function requireCategory(params) {
  const { categorySlug } = await params;

  const category = await getPublicCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return category;
}

// SEO Metadata
export async function generateMetadata({ params }) {
  const category = await requireCategory(params);

  return productPageMetadata({
    title: category.name,
    description: category.description,
    fallbackDescription: `Explore ${category.name} products from ZMSIPL.`,
    path: categoryPath(category),
    image: category.image,
  });
}

// Category Page
export default async function ProductCategoryPage({
  params,
}) {
  const category = await requireCategory(params);

  const { categories, products } = await getCatalogue();

  const isActiveCategory = categories.some(
    (item) => String(item._id) === String(category._id)
  );

  if (!isActiveCategory) {
    notFound();
  }

  const assignedProducts = products.filter(
    (product) =>
      String(categoryId(product)) === String(category._id)
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600"
      >
        <Link
          href="/"
          className="transition-colors hover:text-orange-500"
        >
          Home
        </Link>

        <span aria-hidden="true">/</span>

        <Link
          href="/product"
          className="transition-colors hover:text-orange-500"
        >
          Products
        </Link>

        <span aria-hidden="true">/</span>

        <span
          aria-current="page"
          className="font-medium text-[#1d2b3a]"
        >
          {category.name}
        </span>
      </nav>

      {/* Category Heading */}
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[3px] text-[#ff6b2c]">
          Explore Our Products
        </p>

        <h1 className="text-4xl font-semibold text-[#1d2b3a] sm:text-5xl">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600">
            {category.description}
          </p>
        )}
      </div>

      {/* Dynamic Products */}
      <ProductCards products={assignedProducts} />
    </section>
  );
}

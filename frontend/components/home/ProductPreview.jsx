import Link from "next/link";
import { getPublicCategories } from "@/lib/productCatalogue.server";
import ProductPreviewCarousel from "./ProductPreviewCarousel";

export default async function ProductPreview() {
  let categories = [];
  let unavailable = false;
  try {
    categories = await getPublicCategories();
  } catch {
    unavailable = true;
  }
  return (
    <section className="w-full bg-[#f7f7f7] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-[Lato] text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6b2c]">
            Our Products
          </p>

          <h2 className="mt-3 font-[Bebas_Neue] text-4xl tracking-wide text-[#1d2b3a] sm:text-5xl md:text-6xl">
            Precision Engineered Steel Products
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-[Lato] text-base leading-7 text-gray-600">
            Explore our range of purlins, cleats, and plates built for solar
            mounting structures and industrial fabrication projects.
          </p>
        </div>

        <ProductPreviewCarousel categories={categories} unavailable={unavailable} />

        <div className="mt-12 text-center">
          <Link
            href="/product"
            className="inline-flex items-center rounded-full bg-[#ff6b2c] px-7 py-3 font-[Poppins] text-sm font-semibold text-white transition hover:bg-[#1d2b3a]"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

import { withPageSeo } from "@/lib/pageSeo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProduct } from "@/lib/productCatalogue.server";
import { categoryPath } from "@/lib/productCatalogue";
import ProductDetails from "@/components/Product/ProductDetails";
import { productPageMetadata, productStructuredData, serializeProductStructuredData } from "@/lib/productSeo";

async function requireProduct(params) {
  const { productSlug } = await params;
  const result = await getPublicProduct(productSlug);
  if (!result) notFound();
  return result;
}

async function originalMetadata({ params }) {
  const { product } = await requireProduct(params);
  return productPageMetadata({
    title: product.name,
    description: product.description,
    fallbackDescription: `Discover ${product.name}, technical specifications and enquiries at ZMSIPL.`,
    path: product.detailPath,
    image: product.image,
  });
}

export default async function ProductDetailPage({ params }) {
  const { product, category } = await requireProduct(params);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeProductStructuredData(productStructuredData(product, category)) }} />
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1280px] flex-wrap gap-2 px-6 pt-10 text-sm text-gray-600 sm:px-10 lg:px-20">
        <Link href="/" className="hover:text-orange-500">Home</Link><span aria-hidden="true">/</span>
        <Link href="/product" className="hover:text-orange-500">Products</Link><span aria-hidden="true">/</span>
        {category && <><Link href={categoryPath(category)} className="hover:text-orange-500">{category.name}</Link><span aria-hidden="true">/</span></>}
        <span aria-current="page">{product.name}</span>
      </nav>
      <ProductDetails products={[product]} detailView />
    </>
  );
}
export async function generateMetadata(props) {
  const fallback = await originalMetadata(props);
  const canonical = fallback.alternates?.canonical;
  const path = canonical ? new URL(canonical, "https://www.zmsipl.com").pathname : null;
  return path ? withPageSeo(path, fallback) : fallback;
}

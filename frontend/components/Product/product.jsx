import ProductHero from "./ProductHero";
import CategoryCatalogue from "./CategoryCatalogue";
import { getPublicCategories } from "@/lib/productCatalogue.server";

export default async function Products() {
  const categories = await getPublicCategories();
  return (
    <>
      <ProductHero />
      <CategoryCatalogue categories={categories} />
    </>
  );
}

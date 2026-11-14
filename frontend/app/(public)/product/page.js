import Products from "@/components/Product/product";
import { productPageMetadata } from "@/lib/productSeo";

export const metadata = productPageMetadata({
  title: "Steel Products & Solar Mounting Structures",
  description: "Explore ZMSIPL solar mounting structures, metal purlins and customised structural solutions. Browse product categories and technical specifications.",
  path: "/product",
});

export default function ProductPage() {
  return <Products />;
}
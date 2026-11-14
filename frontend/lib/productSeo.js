import { catalogueImage } from "./productCatalogue";

export const PRODUCT_SITE_URL = "https://www.zmsipl.com";

export function productSeoImage(src) {
  const image = catalogueImage(src);
  if (!image) return null;
  try {
    const url = new URL(image, PRODUCT_SITE_URL);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function productPageMetadata({ title, description, fallbackDescription, path, image }) {
  const summary = typeof description === "string" && description.trim() ? description.trim() : fallbackDescription;
  const canonical = `${PRODUCT_SITE_URL}${path}`;
  const imageUrl = productSeoImage(image);
  return {
    title,
    description: summary,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ZMSIPL`,
      description: summary,
      url: canonical,
      siteName: "ZMSIPL",
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
  };
}

export function productStructuredData(product, category) {
  const canonical = `${PRODUCT_SITE_URL}${product.detailPath}`;
  const image = productSeoImage(product.image);
  const specifications = Array.isArray(product.specifications)
    ? product.specifications.filter((spec) => typeof spec?.label === "string" && spec.label.trim() && typeof spec.value === "string" && spec.value.trim())
    : [];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonical}#product`,
    name: product.name,
    url: canonical,
    ...(typeof product.description === "string" && product.description.trim() ? { description: product.description.trim() } : {}),
    ...(image ? { image: [image] } : {}),
    ...(category?.name ? { category: category.name } : {}),
    ...(specifications.length ? {
      additionalProperty: specifications.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label.trim(),
        value: spec.value.trim(),
      })),
    } : {}),
  };
}

export function serializeProductStructuredData(data) {
  // Prevent a supplied description or specification from terminating the script.
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

import {
  activeCategories,
  publishedProducts,
  isCatalogueSlug,
  categoryId,
} from "@/lib/productCatalogue";

const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

async function fetchPublicAPI(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `Catalogue API request failed (${response.status})`
    );
  }

  return response.json();
}

export async function getPublicCategories() {
  return activeCategories(await fetchPublicAPI("/api/product-categories"));
}

// Fetch public categories and products.
export async function getCatalogue() {
  const [categoryData, productData] = await Promise.all([
    fetchPublicAPI("/api/product-categories"),
    fetchPublicAPI("/api/products"),
  ]);

  const categories = activeCategories(categoryData);

  const products = publishedProducts(
    productData,
    categories
  );

  return {
    categories,
    products,
  };
}

// Find a published category by slug.
export async function getPublicCategory(slug) {
  if (!isCatalogueSlug(slug)) {
    return null;
  }

  const response = await fetch(
    `${API_BASE}/api/product-categories/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Category API unavailable (${response.status})`
    );
  }

  const category = await response.json();

  if (
    !category ||
    category.status !== "Active" ||
    category.slug !== slug
  ) {
    return null;
  }

  return category;
}

// Find a published product by slug or legacy ID URL.
export async function getPublicProduct(slug) {
  if (!isCatalogueSlug(slug)) {
    return null;
  }

  const { categories, products } = await getCatalogue();

  const product = products.find(
    (item) =>
      item.detailSlug === slug ||
      `item-${item._id}` === slug
  );

  if (!product) {
    return null;
  }

  const assignedCategoryId = categoryId(product);

  const category = assignedCategoryId
    ? categories.find(
        (item) =>
          String(item._id) === String(assignedCategoryId)
      )
    : null;

  // Reject products with unresolved category references.
  if (assignedCategoryId && !category) {
    return null;
  }

  return {
    product,
    category: category || null,
  };
}

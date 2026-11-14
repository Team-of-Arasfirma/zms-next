export const isProductSlug = (value) =>
  typeof value === "string" &&
  value.length <= 200 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
  value !== "category" &&
  !/^item-[a-f0-9]{24}$/.test(value);

export const generateProductSlug = (name) => {
  const slug = String(name).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 200).replace(/-+$/g, "") || "product";
  return isProductSlug(slug) ? slug : `${slug.slice(0, 192)}-product`;
};
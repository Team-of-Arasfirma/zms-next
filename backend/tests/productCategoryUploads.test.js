import assert from "node:assert/strict";
import { after, test } from "node:test";
import express from "express";
import ProductCategory from "../models/productCategoryModel.js";
import { productCategoryStorage } from "../config/cloudinary.js";
import { uploadCategoryImage } from "../routes/productCategoryRoutes.js";
import { createCategory, updateCategory } from "../controllers/productCategoryController.js";

// No database connection or Cloudinary requests: exercise real Multer parsing,
// controller validation and Mongoose document validation against in-memory stubs.
const original = {
  handle: productCategoryStorage._handleFile,
  remove: productCategoryStorage._removeFile,
  exists: ProductCategory.exists,
  find: ProductCategory.findById,
  save: ProductCategory.prototype.save,
};
let writes = 0;
let uploads = 0;
const image = "https://res.cloudinary.com/test/image/upload/ZMS/product-categories/new.png";
productCategoryStorage._handleFile = (req, file, callback) => {
  uploads++;
  let size = 0;
  file.stream.on("data", (chunk) => { size += chunk.length; });
  file.stream.on("end", () => callback(null, { path: image, filename: "test-new", size }));
};
productCategoryStorage._removeFile = (req, file, callback) => callback(null);
ProductCategory.exists = async () => false;
ProductCategory.prototype.save = async function () { writes++; return this; };
const id = "507f1f77bcf86cd799439011";
const existingImage = "https://example.com/existing.png";
ProductCategory.findById = async () => new ProductCategory({
  _id: id, name: "Existing", slug: "existing", image: existingImage,
  defaultEnquiryType: "solar", status: "Active", order: 2,
});
const app = express();
app.use(express.json());
app.post("/categories", uploadCategoryImage, createCategory);
app.put("/categories/:id", uploadCategoryImage, updateCategory);
const server = await new Promise((resolve) => {
  const running = app.listen(0, "127.0.0.1", () => resolve(running));
});
const base = `http://127.0.0.1:${server.address().port}/categories`;
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  productCategoryStorage._handleFile = original.handle;
  productCategoryStorage._removeFile = original.remove;
  ProductCategory.exists = original.exists;
  ProductCategory.findById = original.find;
  ProductCategory.prototype.save = original.save;
});
function form(fields = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
  return body;
}
async function request(body, editing = false) {
  const response = await fetch(editing ? `${base}/${id}` : base, {
    method: editing ? "PUT" : "POST",
    headers: body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}

test("multipart creation parses order and saves uploaded URL and enquiry type", async () => {
  const body = form({ name: "Panels", slug: "panels", order: "12", defaultEnquiryType: "solar" });
  body.append("image", new Blob(["mock image"], { type: "image/png" }), "panels.PNG");
  const result = await request(body);
  assert.equal(result.status, 201);
  assert.equal(result.data.category.order, 12);
  assert.equal(result.data.category.image, image);
  assert.equal(result.data.category.defaultEnquiryType, "solar");
});

test("JSON creation remains supported", async () => {
  const result = await request({ name: "Steel", slug: "steel", order: 0 });
  assert.equal(result.status, 201);
});

test("JSON and multipart edits preserve existing image and enquiry type without replacement", async () => {
  for (const body of [{ name: "Renamed", image: "" }, form({ order: "3" })]) {
    const result = await request(body, true);
    assert.equal(result.status, 200);
    assert.equal(result.data.category.image, existingImage);
    assert.equal(result.data.category.defaultEnquiryType, "solar");
  }
});

test("upload replaces the image reference", async () => {
  const body = form();
  body.append("image", new Blob(["mock image"], { type: "image/webp" }), "panels.webp");
  const result = await request(body, true);
  assert.equal(result.status, 200);
  assert.equal(result.data.category.image, image);
});

test("invalid orders, repeated fields and enquiry types cause no writes", async () => {
  const before = writes;
  for (const order of ["", "-1", "1.5", "Infinity", "9007199254740992"]) {
    assert.equal((await request(form({ order }), true)).status, 400);
  }
  const repeated = form({ order: "1" }); repeated.append("order", "2");
  assert.equal((await request(repeated, true)).status, 400);
  assert.equal((await request(form({ defaultEnquiryType: "invalid" }), true)).status, 400);
  assert.equal(writes, before);
});

test("invalid image types and filename extensions return 400 before upload or writes", async () => {
  const before = writes; const beforeUploads = uploads;
  for (const [type, name] of [["image/gif", "image.gif"], ["image/png", "image.svg"]]) {
    const body = form(); body.append("image", new Blob(["bad"], { type }), name);
    assert.equal((await request(body, true)).status, 400);
  }
  assert.equal(writes, before);
  assert.equal(uploads, beforeUploads);
});

test("oversized uploads return 413 and cause no writes", async () => {
  const before = writes;
  const body = form();
  body.append("image", new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/png" }), "large.png");
  assert.equal((await request(body, true)).status, 413);
  assert.equal(writes, before);
});

test("duplicate slug remains a conflict with no writes", async () => {
  const before = writes;
  ProductCategory.exists = async () => true;
  try {
    assert.equal((await request({ name: "Duplicate", slug: "existing" })).status, 409);
    assert.equal(writes, before);
  } finally { ProductCategory.exists = async () => false; }
});

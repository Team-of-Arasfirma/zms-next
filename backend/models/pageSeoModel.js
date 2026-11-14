import mongoose from "mongoose";
const schema = new mongoose.Schema({
  // Built-in unique _id index prevents duplicates without an index migration.
  _id: String,
  pageKey: { type: String, required: true },
  pagePath: { type: String, required: true },
  seoTitle: { type: String, trim: true, maxlength: 300, default: "" },
  metaDescription: { type: String, trim: true, maxlength: 2000, default: "" },
  disabled: { type: Boolean, default: false },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true, autoIndex: false, autoCreate: false });
export default mongoose.model("PageSeo", schema);

import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    inquiryName: {
      type: String,
      required: true,
      trim: true,
    },
    callNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },
    mountType: {
      type: String,
      required: true,
      trim: true,
    },
    mw: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Closed"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

const Quote = mongoose.model("Quote", quoteSchema);

export default Quote;
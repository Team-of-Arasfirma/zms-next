import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
  {
    oldUrl: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    newUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Draft"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Redirect = mongoose.model("Redirect", redirectSchema);

export default Redirect;
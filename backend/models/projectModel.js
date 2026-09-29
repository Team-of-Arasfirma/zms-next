import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: String,
      required: true,
      trim: true,
    },

    capacityMw: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Completed", "Ongoing", "Upcoming"],
      default: "Completed",
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ capacityMw: -1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
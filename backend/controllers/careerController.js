import mongoose from "mongoose";
import Career from "../models/careerModel.js";

const normalizeStatus = (status) => {
  const allowedStatuses = ["Active", "Draft"];

  return allowedStatuses.includes(status) ? status : "Active";
};

// Create a new job post.
export const createCareer = async (req, res) => {
  try {
    const {
      jobTitle,
      department,
      location,
      jobType,
      experience,
      salary,
      openPositions,
      jobOpenDate,
      jobCloseDate,
      description,
      status,
    } = req.body;

    if (!jobTitle || !department || !location || !description) {
      return res.status(400).json({
        message:
          "Job title, department, location, and description are required",
      });
    }

    const career = await Career.create({
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      location: location.trim(),
      jobType: jobType?.trim() || "Full Time",
      experience: experience?.trim() || "",
      salary: salary?.trim() || "",
      openPositions: openPositions?.toString().trim() || "",
      jobOpenDate: jobOpenDate || "",
      jobCloseDate: jobCloseDate || "",
      description: description.trim(),
      status: normalizeStatus(status),
    });

    return res.status(201).json({
      message: "Job added successfully",
      career,
    });
  } catch (error) {
    console.error("Create Career Error:", error);

    return res.status(500).json({
      message: "Failed to add job",
      error: error.message,
    });
  }
};

// Get all job posts.
export const getCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(careers);
  } catch (error) {
    console.error("Get Careers Error:", error);

    return res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// Get one job post by ID.
export const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent Mongoose CastError for invalid IDs.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const career = await Career.findById(id);

    if (!career) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json(career);
  } catch (error) {
    console.error("Get Career By ID Error:", error);

    return res.status(500).json({
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// Update one job post.
export const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const career = await Career.findById(id);

    if (!career) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const {
      jobTitle,
      department,
      location,
      jobType,
      experience,
      salary,
      openPositions,
      jobOpenDate,
      jobCloseDate,
      description,
      status,
    } = req.body;

    if (!jobTitle || !department || !location || !description) {
      return res.status(400).json({
        message:
          "Job title, department, location, and description are required",
      });
    }

    career.jobTitle = jobTitle.trim();
    career.department = department.trim();
    career.location = location.trim();
    career.jobType = jobType?.trim() || "Full Time";
    career.experience = experience?.trim() || "";
    career.salary = salary?.trim() || "";
    career.openPositions =
      openPositions?.toString().trim() || "";
    career.jobOpenDate = jobOpenDate || "";
    career.jobCloseDate = jobCloseDate || "";
    career.description = description.trim();
    career.status = normalizeStatus(status);

    const updatedCareer = await career.save();

    return res.status(200).json({
      message: "Job updated successfully",
      career: updatedCareer,
    });
  } catch (error) {
    console.error("Update Career Error:", error);

    return res.status(500).json({
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete one job post.
export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const career = await Career.findByIdAndDelete(id);

    if (!career) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Career Error:", error);

    return res.status(500).json({
      message: "Failed to delete job",
      error: error.message,
    });
  }
};
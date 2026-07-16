import Project from "../models/projectModel.js";

// Return a valid project status. If the status is invalid, use Completed as default.
const normalizeStatus = (status) => {
  const allowedStatuses = ["Completed", "Ongoing", "Upcoming"];

  if (allowedStatuses.includes(status)) {
    return status;
  }

  return "Completed";
};

// -------------------------------
// Create Project
// Save a new project from the admin upload form
// -------------------------------
export const createProject = async (req, res) => {
  try {
    const { title, capacity, location, status } = req.body;

    // Validate required text fields
    if (!title || !capacity || !location) {
      return res.status(400).json({
        message: "Title, capacity, and location are required",
      });
    }

    // Validate required image file
    if (!req.file) {
      return res.status(400).json({
        message: "Project image is required",
      });
    }

    // Log the Cloudinary upload response for debugging
    console.log("Uploaded file from Cloudinary:", req.file);

    // Get the uploaded Cloudinary image URL
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;

    if (!imageUrl) {
      return res.status(500).json({
        message: "Cloudinary image URL not found",
      });
    }

    // Save the project details in MongoDB
    const project = await Project.create({
      title: title.trim(),
      capacity: capacity.trim(),
      location: location.trim(),
      status: normalizeStatus(status),
      image: imageUrl,
    });

    // Log the saved project for confirmation
    console.log("Project saved in MongoDB:", project);

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Projects
// Fetch projects for the public website and admin table
// -------------------------------
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);

    return res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// -------------------------------
// Update Project
// Update an existing project from the admin edit form
// -------------------------------
export const updateProject = async (req, res) => {
  try {
    const { title, capacity, location, status } = req.body;

    // Validate required text fields
    if (!title || !capacity || !location) {
      return res.status(400).json({
        message: "Title, capacity, and location are required",
      });
    }

    // Find the existing project by ID
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Update text fields
    project.title = title.trim();
    project.capacity = capacity.trim();
    project.location = location.trim();
    project.status = normalizeStatus(status);

    // Replace the image only when a new image is uploaded
    // If no new image is uploaded, keep the old image
    if (req.file) {
      console.log("Updated file from Cloudinary:", req.file);

      const imageUrl = req.file.path || req.file.secure_url || req.file.url;

      if (!imageUrl) {
        return res.status(500).json({
          message: "Cloudinary image URL not found",
        });
      }

      project.image = imageUrl;
    }

    const updatedProject = await project.save();

    console.log("Project updated in MongoDB:", updatedProject._id);

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Error:", error);

    return res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// -------------------------------
// Delete Project
// Delete a project from the admin table
// -------------------------------
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    console.log("Project deleted from MongoDB:", project._id);

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
      error: error.message,
    });
  }
};
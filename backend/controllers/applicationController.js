import Application from "../models/applicationModel.js";

const getResumeUrl = (file) => {
  return file?.path || file?.secure_url || file?.url || "";
};

// Create a new job application from the public career apply page.
export const createApplication = async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      experience,
      portfolioUrl,
      linkedinUrl,
      coverLetter,
      message,
    } = req.body;

    if (!jobId || !jobTitle || !fullName || !email || !phone || !experience) {
      return res.status(400).json({
        message: "Job, name, email, phone, and experience are required",
      });
    }

    const resumeUrl = getResumeUrl(req.file);

    if (!resumeUrl) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const application = await Application.create({
      jobId,
      jobTitle: jobTitle.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      experience: experience.trim(),
      portfolioUrl: portfolioUrl?.trim() || "",
      linkedinUrl: linkedinUrl?.trim() || "",
      coverLetter: coverLetter?.trim() || "",
      message: message?.trim() || "",
      resume: resumeUrl,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Create Application Error:", error);

    return res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

// Get all applications for admin panel.
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Get Applications Error:", error);

    return res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// Update application status from admin panel.
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["New", "Reviewed", "Shortlisted", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = status;

    const updatedApplication = await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// Delete one application from admin panel.
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);

    return res.status(500).json({
      message: "Failed to delete application",
      error: error.message,
    });
  }
};
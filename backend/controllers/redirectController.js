import Redirect from "../models/redirectModel.js";

const normalizeUrl = (url) => {
  if (!url) return "";

  const cleanUrl = url.trim();

  if (cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  return `/${cleanUrl}`;
};

const normalizeStatus = (status) => {
  return status === "Draft" ? "Draft" : "Active";
};

// Create redirect.
export const createRedirect = async (req, res) => {
  try {
    const { oldUrl, newUrl, status } = req.body;

    if (!oldUrl || !newUrl) {
      return res.status(400).json({
        message: "Old URL and New URL are required",
      });
    }

    const redirect = await Redirect.create({
      oldUrl: normalizeUrl(oldUrl),
      newUrl: normalizeUrl(newUrl),
      status: normalizeStatus(status),
    });

    return res.status(201).json({
      message: "Redirect added successfully",
      redirect,
    });
  } catch (error) {
    console.error("Create Redirect Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This old URL already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to add redirect",
      error: error.message,
    });
  }
};

// Get all redirects.
export const getRedirects = async (req, res) => {
  try {
    const redirects = await Redirect.find().sort({ createdAt: -1 });

    return res.status(200).json(redirects);
  } catch (error) {
    console.error("Get Redirects Error:", error);

    return res.status(500).json({
      message: "Failed to fetch redirects",
      error: error.message,
    });
  }
};

// Update redirect.
export const updateRedirect = async (req, res) => {
  try {
    const redirect = await Redirect.findById(req.params.id);

    if (!redirect) {
      return res.status(404).json({
        message: "Redirect not found",
      });
    }

    const { oldUrl, newUrl, status } = req.body;

    if (!oldUrl || !newUrl) {
      return res.status(400).json({
        message: "Old URL and New URL are required",
      });
    }

    redirect.oldUrl = normalizeUrl(oldUrl);
    redirect.newUrl = normalizeUrl(newUrl);
    redirect.status = normalizeStatus(status);

    const updatedRedirect = await redirect.save();

    return res.status(200).json({
      message: "Redirect updated successfully",
      redirect: updatedRedirect,
    });
  } catch (error) {
    console.error("Update Redirect Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This old URL already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update redirect",
      error: error.message,
    });
  }
};

// Delete redirect.
export const deleteRedirect = async (req, res) => {
  try {
    const redirect = await Redirect.findByIdAndDelete(req.params.id);

    if (!redirect) {
      return res.status(404).json({
        message: "Redirect not found",
      });
    }

    return res.status(200).json({
      message: "Redirect deleted successfully",
    });
  } catch (error) {
    console.error("Delete Redirect Error:", error);

    return res.status(500).json({
      message: "Failed to delete redirect",
      error: error.message,
    });
  }
};
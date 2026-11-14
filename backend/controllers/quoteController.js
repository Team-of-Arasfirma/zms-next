import Quote from "../models/quoteModel.js";

// -------------------------------
// Create Quote Inquiry
// Save quote request submitted from the public website
// -------------------------------
export const createQuote = async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ message: "Invalid enquiry input" });
    }
    // Omitting the type keeps all historical solar clients compatible.
    const enquiryType = body.enquiryType === undefined ? "solar" : body.enquiryType;
    if (!["solar", "general"].includes(enquiryType)) {
      return res.status(400).json({ message: "Invalid enquiry type" });
    }
    const text = (key, required = false, maxLength = 200) => {
      const value = body[key];
      if (value == null && !required) return "";
      if (typeof value !== "string" || value.trim().length > maxLength || (required && !value.trim())) {
        const error = new Error(`Invalid or missing ${key}`);
        error.status = 400;
        throw error;
      }
      return value.trim();
    };
    const data = {
      enquiryType,
      companyName: text("companyName", true),
      inquiryName: text("inquiryName", true),
      callNumber: text("callNumber", true, 40),
      gstNumber: text("gstNumber", false, 100),
      productName: text("productName"),
      categoryName: text("categoryName"),
      productSlug: text("productSlug"),
      categorySlug: text("categorySlug"),
      message: text("message", false, 2000),
    };
    const phoneDigits = data.callNumber.replace(/\D/g, "");
    if (!/^[+()\d .-]+$/.test(data.callNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      return res.status(400).json({ message: "Enter a valid contact phone number" });
    }
    for (const key of ["productSlug", "categorySlug"]) {
      if (data[key] && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data[key])) {
        return res.status(400).json({ message: `Invalid ${key}` });
      }
    }
    if (enquiryType === "solar") {
      data.mountType = text("mountType", true);
      data.mw = text("mw", true, 100);
    }
    // General enquiries never store invented solar values. Context strings are
    // optional user-supplied snapshots, not authoritative product references.
    const quote = await Quote.create(data);
    return res.status(201).json({
      message: "Quote request submitted successfully",
      quote,
    });
  } catch (error) {
    if (error.status === 400 || error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Create Quote Error:", error);

    return res.status(500).json({
      message: "Failed to submit quote request",
      error: error.message,
    });
  }
};

// -------------------------------
// Get Quote Inquiries
// Fetch all quote inquiries for the admin panel
// -------------------------------
export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });

    return res.status(200).json(quotes);
  } catch (error) {
    console.error("Get Quotes Error:", error);

    return res.status(500).json({
      message: "Failed to fetch quote inquiries",
      error: error.message,
    });
  }
};

// -------------------------------
// Update Quote Status
// Update inquiry status from the admin panel
// -------------------------------
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["New", "Contacted", "Closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid quote status",
      });
    }

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        message: "Quote inquiry not found",
      });
    }

    quote.status = status;

    const updatedQuote = await quote.save();

    return res.status(200).json({
      message: "Quote status updated successfully",
      quote: updatedQuote,
    });
  } catch (error) {
    console.error("Update Quote Status Error:", error);

    return res.status(500).json({
      message: "Failed to update quote status",
      error: error.message,
    });
  }
};

// -------------------------------
// Delete Quote Inquiry
// Delete one quote inquiry from the admin panel
// -------------------------------
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);

    if (!quote) {
      return res.status(404).json({
        message: "Quote inquiry not found",
      });
    }

    return res.status(200).json({
      message: "Quote inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quote Error:", error);

    return res.status(500).json({
      message: "Failed to delete quote inquiry",
      error: error.message,
    });
  }
};
import Quote from "../models/quoteModel.js";

// -------------------------------
// Create Quote Inquiry
// Save quote request submitted from the public website
// -------------------------------
export const createQuote = async (req, res) => {
  try {
    const {
      companyName,
      inquiryName,
      callNumber,
      gstNumber,
      mountType,
      mw,
      productName,
    } = req.body;

    // Validate required fields
    if (!companyName || !inquiryName || !callNumber || !mountType || !mw) {
      return res.status(400).json({
        message:
          "Company name, inquiry name, call number, mount type, and MW are required",
      });
    }

    const quote = await Quote.create({
      companyName: companyName.trim(),
      inquiryName: inquiryName.trim(),
      callNumber: callNumber.trim(),
      gstNumber: gstNumber?.trim() || "",
      mountType: mountType.trim(),
      mw: mw.trim(),
      productName: productName?.trim() || "",
    });

    return res.status(201).json({
      message: "Quote request submitted successfully",
      quote,
    });
  } catch (error) {
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
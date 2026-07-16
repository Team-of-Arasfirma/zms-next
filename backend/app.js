import express from "express";
import cors from "cors";

import projectRoutes from "./routes/projectRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

//login
import authRoutes from "./routes/authRoutes.js";
const app = express();

// -------------------------------
// CORS middleware
// Allow frontend localhost ports.
// -------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://zms-next.onrender.com",
      "https://zms-backend.onrender.com",
    ],
    credentials: true,
  })
);

// -------------------------------
// Body parser middleware
// Read JSON data and form data.
// -------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Static uploads middleware
// Resume files stored in backend/uploads can be opened by URL.
// Example: const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";/uploads/resumes/file.pdf
// -------------------------------
app.use("/uploads", express.static("uploads"));

// -------------------------------
// Test route
// Browser check: const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
// -------------------------------
app.get("/", (req, res) => {
  res.send("ZMS Backend API is running...");
});

// -------------------------------
// API routes
// -------------------------------
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/redirects", redirectRoutes);
// RBAC CHANGE: Added admin user management routes for superAdmin only.
app.use("/api/admin-users", adminUserRoutes);
//login
app.use("/api/auth", authRoutes);

// -------------------------------
// 404 route
// Show clear message for wrong API paths.
// -------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

// -------------------------------
// Error handler
// Show backend errors in terminal and return clean response.
// -------------------------------
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);

  res.status(500).json({
    message: err.message || "Server error",
  });
});

export default app;

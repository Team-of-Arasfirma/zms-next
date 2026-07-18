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
import authRoutes from "./routes/authRoutes.js";

const app = express();

// -------------------------------
// Allowed frontend origins
// Add localhost, Render frontend and Vercel frontend URLs here.
// -------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://192.168.1.239:3000",

  "https://zms-next.onrender.com",
  "https://zms-next.vercel.app",
];

// -------------------------------
// CORS middleware
// Must be placed before API routes.
// -------------------------------
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an origin, such as Postman or server-to-server calls.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------------
// Body parser middleware
// Read JSON and form data.
// -------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Static uploads middleware
// Resume files can be opened using /uploads/<filename>.
// -------------------------------
app.use("/uploads", express.static("uploads"));

// -------------------------------
// Backend test route
// -------------------------------
app.get("/", (req, res) => {
  res.status(200).send("ZMS Backend API is running...");
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
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/auth", authRoutes);

// -------------------------------
// 404 handler
// -------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

// -------------------------------
// Global error handler
// -------------------------------
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);

  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: err.message || "Server error",
  });
});

export default app;
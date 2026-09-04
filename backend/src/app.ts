import express from "express";
import cors from "cors"
import helmet from "helmet";
import rateLimit from "express-rate-limit";


import recipeRoutes from "./routes/recipe.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express()

// Basic parser and security headers
app.use(helmet());
app.use(express.json());

// CORS configuration (MUST be registered before rate limiters so 429 responses include CORS headers)
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global Rate limiting (protects against DOS while allowing normal SPA navigation)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  message: { message: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Don't count CORS preflight checks against limit
});

app.use(globalLimiter);


app.use("/api", authRoutes)
app.use("/api", recipeRoutes)
app.use("/api", userRoutes )





export default app;
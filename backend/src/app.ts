import express from "express";
import cors from "cors"
import helmet from "helmet";
import rateLimit from "express-rate-limit";


import recipeRoutes from "./routes/recipe.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express()

// Middlewares
app.use(helmet());
// Rate limiting
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(globalLimiter);



app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));


app.use("/api", authRoutes)
app.use("/api", recipeRoutes)
app.use("/api", userRoutes )





export default app;
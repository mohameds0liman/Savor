import express from "express";
import cors from "cors"

import recipeRoutes from "./routes/recipe.routes";


const app = express()
app.use(express.json())
app.use(cors())
app.use("/api", recipeRoutes)


// app.use("/api", authRoutes)
// app.use("/api", userRoutes)





export default app;
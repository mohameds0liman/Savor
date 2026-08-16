import express from "express";


import recipeRoutes from "./routes/recipe.routes";


const app = express()
app.use(express.json())

app.use("/api", recipeRoutes)


// app.use("/api", authRoutes)
// app.use("/api", userRoutes)





export default app;
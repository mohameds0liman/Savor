import app from "./app.ts"
import {connectDB} from "./config/db.ts"
import dotenv from "dotenv"

dotenv.config()
const PORT=process.env.PORT || 5000

async function startdb() {
    await connectDB()
}

startdb()

app.listen(PORT,()=>{
    console.log("server is listening to PORT: ",PORT)
})

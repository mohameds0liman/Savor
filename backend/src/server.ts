import {env} from "./config/env.ts"
import app from "./app.ts"
import {connectDB} from "./config/db.ts"


const PORT = env.PORT

async function startServer() {
    await connectDB()

    app.listen(PORT,()=>{
    console.log("server is listening to PORT: ",PORT)
})
}

startServer()




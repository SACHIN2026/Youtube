import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import {app} from "./app.js";


dotenv.config({
    path: "./.env"
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
    
})
.catch(error => {
    console.log("MongoDb connetion failed !!!:",error);});

// ;(async () =>{
//     try { 
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
//     } catch (error) {
//         console.error("ERROR:",error);
//     }
// })()
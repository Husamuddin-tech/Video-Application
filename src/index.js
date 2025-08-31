import connectDB from "./db/index.js";
import dotenv from "dotenv";



dotenv.config({
    path: './env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER IS RUNNING AT PORT : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED!!! ", err)
})















/*
import express from "express";

const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error", (err) => {
            console.log("Error: ", err)
            throw err
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR: ", error)
        throw error
    }
})()

*/

const express = require("express")
const dotenv = require("dotenv").config()
const cors = require("cors")
const mongoose = require("mongoose")

const routes = require("../walletMgt/Routes/routes")


const server = express()

const db = process.env.MONGODB_URL
server.use(express.json())

const PORT = process.env.PORT || 6060

// Middlewares
server.use(express.json())

server.use(cors())


mongoose.connect (db)
 .then (()=> {
    console.log("Mongodb connected...") })

server.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})

server.get("/", (req, res)=>{
    return res.status(200).json({message: 
        "Welcome to Your wallet Gateway"})
})



server.use("/api", routes)




server.use((req, res)=>{
    res.status(404).json({
        message: "Sorry this endpoint does not exist."
    })
})
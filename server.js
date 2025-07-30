const express = require("express")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config()
const port = process.env.PORT || 8080




function connectToMongoDB() {
    try {
        console.log("connected to the database✅");
        mongoose.connect("mongodb://localhost:27017/E_commerce_charity")

    } catch (err) {
        console.log(err);

    }
}





app.get("/", (req, res) => {
    res.send("Welcome to E-commerce charity")
})
app.listen(port, () => {
    connectToMongoDB()
    console.log("server is running at port 3000");

})
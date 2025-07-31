const express = require("express")
const app = express()
app.use(express.json());
const mongoose = require("mongoose")
require("dotenv").config()
const port = process.env.PORT || 8080
const url = process.env.MONGO_URL
const userRoutes=require("./routes/user")

function connectToMongoDB() {
    try {
        
        mongoose.connect(url)
    console.log("connected to the database✅");
    } catch (err) {
        console.log(err);

    }
}
app.use("/api/users",userRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to E-commerce charity")
})
app.listen(port, () => {
    connectToMongoDB()
    console.log("server is running at port 3000");

})
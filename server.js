const express = require("express")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose")
require("dotenv").config()


const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8080
const url = process.env.MONGO_URL
const userRoutes=require("./routes/user")
const categoryRouter=require("./routes/category")

function connectToMongoDB() {
    try {
        mongoose.connect(url)
    console.log("connected to the database✅");
    } catch (err) {
        console.log(err);

    }
}
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/users",userRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to E-commerce charity")
})
app.listen(port, () => {
    connectToMongoDB()
    console.log("server is running at port 3000");

})
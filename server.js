const express=require("express")
const app =express()
require("dotenv").config()
const port=process.env.PORT||8080


app.get("/",(req,res)=>{
  res.send("Welcome to E-commerce charity")
})
app.listen(port,()=>{
    console.log("server is running at port 3000");
    
})
const jwt = require("jsonwebtoken");
const user = require("../model/user");
require('dotenv').config();
const auth= async (req,res,next) =>{
    try{
      res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0")
      const token= req.cookies.jwt;
      const verifyUser=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      console.log(verifyUser);
      const data= await user.findOne({_id:verifyUser._id})
      console.log(data.username);
      req.token=token;
      req.data=data;
        
      next();
    }catch(error){
        // res.status(401).send(error);
      req.flash("error_messages", "Please Login to continue !");
      res.redirect("/login");
    }
}

module.exports= auth;
const mongoose = require("mongoose");
const jwt= require("jsonwebtoken")
require('dotenv').config();
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    match:/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
    
  },
  email: {
    type: String,
    required: true,
    unique:true,
  },
  password: {
    type: String,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  provider: {
    type: String,
    required: true,
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }]
});

userSchema.methods.generateAuthToken= function (){
  try{
    console.log(this._id);
    const maxAge=3*24*60*60;
    const token = jwt.sign({_id:this._id.toString(), username:this.username, email:this.email}, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn:maxAge})
      console.log("token - "+token);
    this.tokens=this.tokens.concat({token:token})
    this.save();
    // console.log(token);
    return token;
  }catch (error){
    // res.send("this error part"+ error);
    console.log("the error part" + error);
  }
}

module.exports = mongoose.model("user", userSchema);

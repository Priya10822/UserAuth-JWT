const express = require("express");
const router = express.Router();
const user = require("../model/user");
const bcryptjs = require("bcryptjs");
const auth= require("../middleware/auth");
const validator=require("email-validator");



router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  // get all the values
  const { email, username, password, confirmpassword } = req.body;
  // check if they are empty
  if(validator.validate(email)){
    console.log("Email is valid");
  }else{
    res.render("signup", { err: "Email is inValid !" });
  }
  if (!email || !username || !password || !confirmpassword) {
    res.render("signup", { err: "All Fields Required !" });
  } else if (password != confirmpassword) {
    res.render("signup", { err: "Password Don't Match !" });
  } else {
    // validate email and username and password
    // check if a user exists
    user.findOne(
      { $or: [{ email: email }, { username: username }] },
      function (err, data) {
        if (err) throw err;
        if (data) {
          res.render("signup", { err: "User Exists, Try Logging In !" });
        } else {
          // generate a salt
          bcryptjs.genSalt(12, (err, salt) => {
            if (err) throw err;
            // hash the password
            bcryptjs.hash(password, salt, (err, hash) => {
              if (err) throw err;
              // save user in db
              user({
                username: username,
                email: email,
                password: hash,
                provider: "email",
              }).save((err, data) => {
                if (err){
                  console.log(err.errors['username'].message);
                  res.status(400).json( {
                    statuscode:400,
                    message:err.message,
                  })
                }
                else{
                res.redirect("/login");
                }
              });
            });
          });
        }
      }
    );
  
  }


});

router.post("/login",async (req, res) => {
  console.log(req)
  const email = req.body.email; 
  const password=req.body.password;

  console.log("Email or Password",email,password);
  const useremail=await user.findOne({email:email});
  console.log("useremail",useremail);
  // const isMatch= await bcryptjs.compare(password,useremail.password);
  if(useremail){
  const token= useremail.generateAuthToken();
  // console.log("the token - "+token);
  res.cookie("jwt",token,{
    maxAge: 3*24*60*60*1000,
    httpOnly:true
  });
}

  bcryptjs.compare(password, useremail.password, (err, match) => {
    if(err) throw err;
    if (match) {
      res.redirect("/profile");
    }
    if(!match){
      // req.flash("error_messages", "Please enter valid credentials !");
      // res.redirect("/login");
      res.json({message:"Invalid credentials"})
    }
})


});


router.get("/profile", auth , (req, res) => {
  // adding a new parameter for checking verification
  // console.log(`This is the cookie awesome - ${req.cookies.jwt}`);
  res.render("profile", {
    username: req.data.username,
    verified: req.data.isVerified,
  });
});

router.get("/logout", auth , async (req, res) => {
  try{
    console.log(req.data);
    res.clearCookie("jwt");
    console.log("logout successfully");
    res.render("login");
    
    
  }
  catch(error){
    res.status(500).send(error);

  }
});
router.get("/login", (req, res) => {
  res.render("login");
});


module.exports = router;

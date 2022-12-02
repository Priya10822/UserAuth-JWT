const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const MemoryStore = require("memorystore")(expressSession);
const flash = require("connect-flash");
const bodyParser=require('body-parser');
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));

const mongoURI = require("./config/mongoKEY");
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected !"));

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(
  expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    //max age to longer duration
    maxAge: 24 * 60 * 60 * 1000,
    store: new MemoryStore(),
  })
);

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  res.locals.error = req.flash("error");
  next();
});

app.use(require("./controller/routes.js"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started At " + PORT));

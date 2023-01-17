const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const createError = require("http-errors");
const passport = require("passport");
const csrf = require("csurf");
const port = process.env.PORT || 4000;
const app = express();

dotenv.config();

app.set("views", path.join(__dirname, "public/views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
   session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: false,
   })
);

app.use(csrf());
app.use(passport.authenticate("session"));
app.use(function (req, res, next) {
   let msgs = req.session.messages || [];
   res.locals.messages = msgs;
   res.locals.hasMessages = !!msgs.length;
   req.session.messages = [];
   next();
});

app.use(function (req, res, next) {
   res.locals.csrfToken = req.csrfToken();
   next();
});

require("./src/routes")(app);

app.use(function (req, res, next) {
   next(createError(404));
});

app.use(function (err, req, res, next) {
   res.locals.message = err.message;
   res.locals.status = err.status || 500;

   res.status(err.status || 500);
   res.render("error", { title: err.status + " " + err.message, user: req.user });
});

app.listen(port, () => console.log(`App started on port ${port}`));

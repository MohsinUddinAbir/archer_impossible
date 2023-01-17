const LocalStrategy = require("passport-local");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const authVerify = require("./middlewares");
const fs = require("fs");
const path = require("path");

module.exports = function (app) {
   app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
      next();
   });

   passport.use(
      new LocalStrategy(function verify(username, password, cb) {
         fs.readFile("./db/users.json", "utf8", (error, data) => {
            if (error) {
               res.redirect("/login");
               return;
            }
            if (data) {
               let users = JSON.parse(data);
               let user = users.find((o, i) => {
                  if (o.email === username || o.username === username) return o;
               });
               if (!user) {
                  return cb(null, false, { message: "Incorrect email." });
               }

               let passwordIsValid = bcrypt.compareSync(password, user.password);
               if (!passwordIsValid) {
                  return cb(null, false, { message: "Incorrect password." });
               }
               return cb(null, user);
            }
         });
      })
   );

   passport.serializeUser((user, cb) => {
      process.nextTick(() => {
         return cb(null, { username: user.username, email: user.email });
      });
   });

   passport.deserializeUser((user, cb) => {
      process.nextTick(() => {
         return cb(null, { username: user.username, email: user.email });
      });
   });

   app.get("/", (req, res) => {
      res.render("index", { title: "Home", user: req.user });
   });

   app.get("/game", authVerify.ensureAuth, (req, res) => {
      res.render("game", { title: "Archer Impossible", user: req.user });
   });

   app.get("/htplay", (req, res) => {
      res.render("htplay", { title: "How to Play", user: req.user });
   });

   app.get("/leaderboard", (req, res) => {
      fs.readFile("./db/users.json", "utf8", (error, data) => {
         let users = [];
         if (data) {
            users = JSON.parse(data);
            users.sort((a, b) => a.time - b.time);
            users.sort((a, b) => b.score - a.score);
            users = users.slice(0, 5);
         }
         return res.render("leaderboard", { title: "Leaderboard", user: req.user, users: users });
      });
   });

   app.get("/account", authVerify.ensureAuth, (req, res) => {
      fs.readFile("./db/users.json", "utf8", (error, data) => {
         if (error) {
            res.redirect("/login");
            return;
         }
         if (data) {
            let users = JSON.parse(data);
            let user = users.find((o, i) => {
               if (o.email === req.user.email) return o;
            });
            if (!user) {
               return res.redirect("/login");
            }
            return res.render("account", { title: "Account", user: user });
         }
      });
   });

   app.get("/login", authVerify.ensureGuest, (req, res) => {
      res.render("login", { title: "Login", user: null });
   });

   app.get("/register", authVerify.ensureGuest, (req, res) => {
      res.render("register", { title: "Register", user: null });
   });

   app.post("/logout", authVerify.ensureAuth, (req, res, next) => {
      req.logout(() => res.redirect("/"));
   });

   app.post("/register", [authVerify.ensureGuest, authVerify.verifyData], async (req, res, next) => {
      fs.readFile("./db/users.json", "utf8", (error, data) => {
         if (error) {
            res.redirect("/register");
            return;
         }
         let users = [];
         if (data) {
            users = JSON.parse(data);
         }
         let user = {
            username: req.body.user,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.pass),
            age: req.body.age,
            score: 0,
            time: 0,
         };
         users.push(user);
         fs.writeFile("./db/users.json", JSON.stringify(users), "utf-8", (error) => {
            if (error) {
               res.redirect("/register");
               return;
            }
            req.login(user, (err) => {
               if (err) {
                  return next(err);
               }
               res.redirect("/");
            });
         });
      });
   });

   app.post(
      "/login",
      authVerify.ensureGuest,
      passport.authenticate("local", {
         successReturnToOrRedirect: "/",
         failureRedirect: "/login",
         failureMessage: true,
      })
   );

   app.post("/update_score", authVerify.ensureAuth, (req, res) => {
      fs.readFile("./db/users.json", "utf8", (error, data) => {
         if (error) {
            res.status(500).send({ message: "Something went wrong, Score not updated!" });
            return;
         }

         if (!data) {
            return res.status(500).send({ message: "Something went wrong, Score not updated!" });
         }

         let users = JSON.parse(data);
         let user = users.find((user, i) => {
            if (user.email === req.user.email) {
               let { score, time } = req.body;
               if (score > user.score) {
                  users.splice(i, 1);
                  user.score = score;
                  user.time = time;
                  users.splice(i, 0, user);
               }
               return user;
            }
         });

         if (user) {
            fs.writeFile("./db/users.json", JSON.stringify(users), "utf-8", (error) => {
               if (error) {
                  return res.status(500).send({ message: "Something went wrong, Score not updated!" });
               }
               return res.status(200).send({ message: "Score updated successfully!" });
            });
         } else {
            return res.status(500).send({ message: "Score not updated, User not found!" });
         }
      });
   });
};

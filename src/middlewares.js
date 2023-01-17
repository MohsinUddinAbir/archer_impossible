const fs = require("fs");
const path = require("path");

const ensureAuth = (req, res, next) => {
   if (req.isAuthenticated()) {
      next();
      return;
   }
   return res.redirect("/login");
};

const ensureGuest = (req, res, next) => {
   if (req.isAuthenticated()) {
      return res.redirect("/");
   }
   next();
   return;
};

const verifyData = async (req, res, next) => {
   if (!req.body.user) {
      req.session.messages = ["Failed! Username field is required!"];
      res.redirect("/register");
      return;
   }
   if (!req.body.email) {
      req.session.messages = ["Failed! Email field is required!"];
      res.redirect("/register");
      return;
   }
   if (!req.body.pass) {
      req.session.messages = ["Failed! Password field is required!"];
      res.redirect("/register");
      return;
   }
   fs.readFile("./db/users.json", "utf8", (error, data) => {
      if (error) {
         res.redirect("/register");
         return;
      }
      if (data) {
         let users = JSON.parse(data);
         let user = users.find((o, i) => {
            if (o.email === req.body.email) return o;
         });

         if (user) {
            req.session.messages = ["Failed! Email is already in use!"];
            res.redirect("/register");
            return;
         } else {
            user = users.find((o, i) => {
               if (o.username === req.body.user) return o;
            });
            if (user) {
               req.session.messages = ["Failed! Username is already in use!"];
               res.redirect("/register");
               return;
            }
            next();
            return;
         }
      } else {
         next();
         return;
      }
   });
};

const authVerify = {
   verifyData,
   ensureAuth,
   ensureGuest,
};

module.exports = authVerify;

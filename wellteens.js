const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user"); // You'll need to create a User model

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost/wellteen", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: "wellteen secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use User model for authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Authentication Routes
app.post("/register", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.redirect("/register");
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect("/dashboard");
      });
    }
  );
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    // Render dashboard page with user info
  } else {
    res.redirect("/login");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

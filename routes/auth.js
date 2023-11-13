const express=require('express')
const router=express.Router()
const User=require('../models/user')
const {calculateTotalAmount}=require('./calculate')
const passport=require('passport')
const session=require('express-session')
const Expense=require('../models/expense')

const LocalStrategy = require("passport-local");
const isLoggedin = require('./isLoggedin')
passport.use(new LocalStrategy(User.authenticate()));
router.get('/register', (req, res) => {
    res.render('register', { error: req.query.error, success: req.query.success });
});

router.post("/register", async function (req, res, next) {
    try {
        // Check for duplicate username or email
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });

        if (existingUser) {
            // User or email already exists
            const errorMessage = "Username or email already in use";
            const encodedError = encodeURIComponent(errorMessage);
            return res.redirect(`/register?error=${encodedError}`);
        }

        // Validate password using regular expression
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/;

        if (!passwordRegex.test(req.body.password.trim())) {
            // Password does not meet criteria
            const errorMessage = "Password must have at least 8 characters, one lowercase letter, one uppercase letter, one digit, and one special character";
            const encodedError = encodeURIComponent(errorMessage);
            return res.redirect(`/register?error=${encodedError}`);
        }

        // If no duplicate and password is valid, proceed with user registration
        await User.register(
            { username: req.body.username, email: req.body.email },
            req.body.password
        );

        // Registration successful
        const successMessage = "You have successfully registered.";
        const encodedSuccess = encodeURIComponent(successMessage);
        return res.redirect(`/login?success=${encodedSuccess}`);
    } catch (error) {
        console.error(error);
        const encodedError = encodeURIComponent("Internal Server Error");
        return res.redirect(`/register?error=${encodedError}`);
    }
});


router.get('/login', (req, res) => {
    res.render('login', { success: req.query.success,error:req.query.error });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard?success=Login%20successful", // Include success message in the query parameter
        failureRedirect: "/login?error=InvalidCredentials", // Redirect with an error parameter
    }),
    function (req, res, next) {}
);
// Dashboard
router.get("/dashboard", isLoggedin, async function (req, res, next) {
    try {
        // Use req.user._id to find the user's expenses
        const userExpenses = await Expense.find({ user: req.user._id });

        // Retrieve the success message from the query parameter
        const successMessage = req.query.success;

        res.render("dashboard", { userExpenses, calculateTotalAmount, successMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server Error" });
    }
});

// Logout
router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

module.exports=router
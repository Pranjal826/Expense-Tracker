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
router.get('/register',(req,res)=>{
    res.render('register')
}
)
router.post("/register", async function (req, res, next) {
    try {
        await User.register(
            { username: req.body.username, email: req.body.email },
            req.body.password
        );
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.get('/login',(req,res)=>{
    res.render('login')
}
)

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);
// Dashboard
router.get("/dashboard", isLoggedin, async function (req, res, next) {
    try {
        // Use req.user._id to find the user's expenses
        const userExpenses = await Expense.find({ user: req.user._id });

        res.render("dashboard", { userExpenses,calculateTotalAmount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server Error" });
    }
});// server-side script (e.g., routes/index.js)

// Logout
router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

module.exports=router
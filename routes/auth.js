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
        // Check for duplicate username or email
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });

        if (existingUser) {
            // User or email already exists
            const errorMessage = "Username or email already in use";
            
            // Return a response with a script to display the alert
            return res.status(409).send(`
                <script>
                    alert("${errorMessage}");
                    window.location.href = "/register"; // Redirect to registration page
                </script>
            `);
        }

        // Validate password using regular expression
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?=.*[#])[A-Za-z\d@$!%*?&#]{8,}$/;


        if (!passwordRegex.test(req.body.password.trim())) {
            // Password does not meet criteria
            const errorMessage = "Password must have at least 8 characters, one lowercase letter, one uppercase letter, one digit, and one special character";
            
            // Return a response with a script to display the alert
            return res.status(400).send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script>
                swal({
                    title: "Error",
                    text: "${errorMessage}",
                    icon: "error",
                }).then(() => {
                    window.location.href = "/register"; // Redirect to registration page
                });
            </script>
        `);
        
        }

        // If no duplicate and password is valid, proceed with user registration
        await User.register(
            { username: req.body.username, email: req.body.email },
            req.body.password
        );

        res.send(`
            <script>
                swal({
                    title: "Registration Successful",
                    text: "You have successfully registered.",
                    icon: "success",
                }).then(() => {
                    window.location.href = "/login"; // Redirect to login page
                });
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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
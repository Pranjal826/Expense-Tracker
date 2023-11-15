const express=require('express')
const router=express.Router()
const User=require('../models/user')
const {calculateTotalAmount}=require('./calculate')
const passport=require('passport')
const session=require('express-session')
const Expense=require('../models/expense')
const crypto=require('crypto')
const nodemailer = require('nodemailer');
const LocalStrategy = require("passport-local");
const isLoggedin = require('./isLoggedin')
passport.use(new LocalStrategy(User.authenticate()));
const transport1 = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "pranjalshukla245@gmail.com",
        pass: "yave tcdt eodj flll",
    },
});
router.get('/register', (req, res) => {
    res.render('register', { error: req.query.error, success: req.query.success });
});


router.post("/register", async function (req, res, next) {
    try {
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Check for duplicate username or email
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });

        if (existingUser) {
            const errorMessage = "Username or email already in use";
            const encodedError = encodeURIComponent(errorMessage);
            return res.redirect(`/register?error=${encodedError}`);
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/;

        if (!passwordRegex.test(req.body.password.trim())) {
            const errorMessage = "Password must have at least 8 characters, one lowercase letter, one uppercase letter, one digit, and one special character";
            const encodedError = encodeURIComponent(errorMessage);
            return res.redirect(`/register?error=${encodedError}`);
        }
        const newUser = new User({ username: req.body.username, email: req.body.email });

        newUser.verificationToken = verificationToken;
        newUser.isVerified = false;
        await User.register(newUser, req.body.password);

        // Send verification email
        const verificationLink = `https://expense-tracker-brown-psi.vercel.app/verify/${verificationToken}`;
        const mailOptions = {
            from: 'pranjalshukla245@gmail.com',
            to: req.body.email,
            subject: 'Verify Your Email',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        background-color: #f4f4f4;
                        padding: 20px;
                        text-align: center;
                    }
            
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
            
                    h2 {
                        color: #333333;
                    }
            
                    p {
                        color: #666666;
                    }
            
                    a {
                        color: #3498db;
                        text-decoration: none;
                        font-weight: bold;
                    }
            
                    a:hover {
                        color: #1e70bf;
                    }
            
                    .footer {
                        margin-top: 20px;
                        color: #999999;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Email Verification</h2>
                    <p>Dear User,</p>
                    <p>Thank you for registering with Expense Tracker. To complete your registration, please click the link below to verify your email:</p>
                    <p><a href="${verificationLink}">${verificationLink}</a></p>
                   
                    <div class="footer">
                        <p>Best regards,<br>Expense Tracker Team</p>
                    </div>
                </div>
            </body>
            </html>
            
            `,
        };

        await transport1.sendMail(mailOptions);
        const successMessage = "You have successfully registered. Please check your email to verify your account.";
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

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login?error=Email%20or%20Password%20Wrong",
}), function (req, res, next) {
    if (req.user && req.user.isVerified) {
        res.redirect("/dashboard?success=Login%20successful");
    } else {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect("/login?error=Email%20or%20Password%20Wrong");
          });
    }
});

router.get("/dashboard", isLoggedin, async function (req, res, next) {
    try {
        const userExpenses = await Expense.find({ user: req.user._id });
        const successMessage = req.query.success;

        res.render("dashboard", { userExpenses, calculateTotalAmount, successMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get('/verify/:token', async function (req, res, next) {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).send('Invalid verification token');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        const successMessage = 'Email verification successful. You can now log in.';
        const encodedSuccess = encodeURIComponent(successMessage);
        return res.redirect(`/login?success=${encodedSuccess}`);
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
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
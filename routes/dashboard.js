var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Expense=require('../models/expense')
const passport = require("passport");
const  isLoggedIn  = require("./isLoggedin");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));

// Dashboard
router.get("/",isLoggedIn, async function (req, res, next) {
  try {
      const user = await User.findById(req.user._id).populate('expenses');

      // Format the date to dd/mm/yyyy
      const formattedExpenses = user.expenses.map(expense => ({
          ...expense.toObject(),
          date: expense.date.toLocaleDateString('en-GB') // Adjust the locale as needed
      }));

      res.render("dashboard", { user, expenses: formattedExpenses });
  } catch (error) {
      console.log(error);
      res.redirect('/login')
  }
});


module.exports=router
var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Expense=require('../models/expense')
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));
var isLoggedIn=require('./isLoggedin')
// expence manage: add,edit,delete
router.get('/addexpense', isLoggedIn, async function (req, res, next) {
    try {
        const userId = req.user._id;
        let result = await User.findById({ _id: userId });
        res.render("addexpense", { result });
    } catch (error) {
        console.log(error);
        throw error;
    }
});

router.post('/addexpense', isLoggedIn, async function (req, res, next) {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.redirect("/login");
        }

        let newExpense = {
            name: req.body.name,
            amount: req.body.amount,
            // Convert the date to a JavaScript Date object
            date: new Date(req.body.date),
            category: req.body.category,
            tags: req.body.tags,
            user: userId
        };

        let result = await Expense.create(newExpense);
        console.log(result);
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        throw error;
    }
});

// Utility function to format date as dd/mm/yyyy
router.get('/editexpense/:id',isLoggedIn,async function(req,res,next){
    try{
    const userId = req.user._id;
    if (!userId){
        return res.redirect("/login");
    }
    let result = await Expense.findById({_id : req.params.id});
    console.log(result);
    res.render("editexpense", { result });
    }
    catch (error) {
        console.log(error);
      throw error;
  }
}
);
router.post('/editexpense/:id',isLoggedIn,async function(req,res,next){
    try{
    const userId = req.user._id;
    if (!userId){
        return res.redirect("/login");
    }
    let result = await Expense.findByIdAndUpdate({_id : req.params.id},{
        name:req.body.name,
        amount:req.body.amount,
        date:req.body.date,
        category:req.body.category,
        tags:req.body.tags,
        user:userId
    });
    console.log(result);
    res.redirect("/dashboard");
    }
    catch (error) {
        console.log(error);
      throw error;
    }
}
);
router.get('/deleteexpense/:id',isLoggedIn,async function(req,res,next){
    try{
    const userId = req.user._id;
    if (!userId){
        return res.redirect("/login");
    }
    let result = await Expense.findByIdAndDelete({_id : req.params.id});
    console.log(result);
    res.redirect("/dashboard");
    }
    catch (error) {
        console.log(error);
      throw error;
    }
}
);
module.exports=router
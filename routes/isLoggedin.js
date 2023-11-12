module.exports=function isLoggedIn(req, res, next) {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
        return next(); // User is logged in, proceed to the next middleware or route handler
    }
    // User is not logged in, redirect to the login page
    res.redirect("/login");
}

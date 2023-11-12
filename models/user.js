const mongoose=require('mongoose')
const plm=require('passport-local-mongoose')
const UserSchema = new mongoose.Schema({
    username: String,
    email: String, 
    password: String
})
UserSchema.plugin(plm)
module.exports=mongoose.model('User',UserSchema)
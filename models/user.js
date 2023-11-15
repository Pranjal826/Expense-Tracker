const mongoose=require('mongoose')
const plm=require('passport-local-mongoose')
const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    } ,
    password:{
        type:String,

    },
    resetPasswordOtp: {
        type: Number,
        default: -1,
      },
      isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String
})
UserSchema.plugin(plm)
module.exports=mongoose.model('User',UserSchema)
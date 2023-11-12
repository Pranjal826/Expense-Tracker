const mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/expense-tracker')
.then(()=>{
    console.log('Connection open')
})
.catch(err=>{
    console.log('Error')
    console.log(err)
})

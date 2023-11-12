const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://pranjalshukla245:RgiDeemJ5JkE7DGt@cluster0.vtjn0jv.mongodb.net/Expense-tracker?retryWrites=true&w=majority',
  {
    useUnifiedTopology: true,
  }
)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Continue with your application logic here...
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB');
    console.error(err);
  });

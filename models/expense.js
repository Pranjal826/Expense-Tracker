const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    name: String,
    amount: Number,
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    category: String,
    tags: [String],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Expense', expenseSchema);

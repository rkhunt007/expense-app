const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IncomeSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = Expense = mongoose.model('income', IncomeSchema);
function calculateTotalAmount(expenses) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

module.exports = {
    calculateTotalAmount
};

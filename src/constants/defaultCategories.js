// Default categories for Zenithly Money Manager
// These will be seeded during onboarding

export const DEFAULT_CATEGORIES = {
    expense: [
        { name: 'Bills & Utilities', iconId: 'receipt', type: 'Expense' },
        { name: 'Food & Dining', iconId: 'utensils', type: 'Expense' },
        { name: 'Groceries', iconId: 'shopping-basket', type: 'Expense' },
        { name: 'Transportation', iconId: 'car', type: 'Expense' },
        { name: 'Shopping', iconId: 'shopping-bag', type: 'Expense' },
        { name: 'Healthcare', iconId: 'heart-pulse', type: 'Expense' },
        { name: 'Entertainment', iconId: 'film', type: 'Expense' },
        { name: 'Education', iconId: 'graduation-cap', type: 'Expense' },
        { name: 'Rent/Mortgage', iconId: 'home', type: 'Expense' },
        { name: 'Insurance', iconId: 'shield', type: 'Expense' },
        { name: 'Subscriptions', iconId: 'repeat', type: 'Expense' },
        { name: 'Personal Care', iconId: 'sparkles', type: 'Expense' },
        { name: 'Other Expenses', iconId: 'more-horizontal', type: 'Expense' },
    ],
    income: [
        { name: 'Salary', iconId: 'banknote', type: 'Income' },
        { name: 'Freelance', iconId: 'briefcase', type: 'Income' },
        { name: 'Investment Returns', iconId: 'trending-up', type: 'Income' },
        { name: 'Interest', iconId: 'percent', type: 'Income' },
        { name: 'Cashback', iconId: 'gift', type: 'Income' },
        { name: 'Bonus', iconId: 'award', type: 'Income' },
        { name: 'Refund', iconId: 'undo', type: 'Income' },
        { name: 'Gifts Received', iconId: 'package', type: 'Income' },
        { name: 'Transfer In', iconId: 'arrow-down-left', type: 'Income' },
        { name: 'Other Income', iconId: 'plus-circle', type: 'Income' },
    ],
    debtLoan: [
        { name: 'Home Loan', iconId: 'home', type: 'Debt/Loan' },
        { name: 'Car Loan', iconId: 'car', type: 'Debt/Loan' },
        { name: 'Education Loan', iconId: 'graduation-cap', type: 'Debt/Loan' },
        { name: 'Personal Loan', iconId: 'user', type: 'Debt/Loan' },
        { name: 'Credit Card Debt', iconId: 'credit-card', type: 'Debt/Loan' },
        { name: 'Borrowed Money', iconId: 'hand-coins', type: 'Debt/Loan' },
        { name: 'Lent Money', iconId: 'arrow-right', type: 'Debt/Loan' },
    ],
};

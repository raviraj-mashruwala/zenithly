// Group transactions by day
export const groupTransactionsByDay = (transactions) => {
    const grouped = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toDateString();
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(transaction);
    });

    // Convert to array and sort by date descending
    return Object.entries(grouped)
        .map(([date, transactions]) => ({
            date: new Date(date),
            transactions,
        }))
        .sort((a, b) => b.date - a.date);
};

// Calculate opening balance for a period
export const calculateOpeningBalance = (wallets, transactions, startDate) => {
    let openingBalance = 0;

    // Start with current wallet balances
    wallets.forEach(wallet => {
        if (wallet.included_in_total) {
            openingBalance += parseFloat(wallet.current_balance || 0);
        }
    });

    // Subtract all transactions from the period
    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate >= new Date(startDate)) {
            if (tx.type === 'Income') {
                openingBalance -= parseFloat(tx.amount);
            } else if (tx.type === 'Expense') {
                openingBalance += parseFloat(tx.amount);
            }
        }
    });

    return openingBalance;
};

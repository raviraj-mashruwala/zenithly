import { supabase } from '../lib/supabase';
import { updateWalletBalance } from './wallet.service';

// Get all transactions for current user
export const getTransactions = async (userId, options = {}) => {
    let query = supabase
        .from('transactions')
        .select(`
      *,
      wallet:wallets!transactions_wallet_id_fkey(id, name, icon_id),
      category:categories(id, name, icon_id, type),
      from_wallet:wallets!transactions_from_wallet_id_fkey(id, name),
      to_wallet:wallets!transactions_to_wallet_id_fkey(id, name)
    `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

    // Apply filters
    if (options.type) {
        query = query.eq('type', options.type);
    }
    if (options.walletId) {
        query = query.or(`wallet_id.eq.${options.walletId},from_wallet_id.eq.${options.walletId},to_wallet_id.eq.${options.walletId}`);
    }
    if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }
    if (options.startDate) {
        query = query.gte('date', options.startDate);
    }
    if (options.endDate) {
        query = query.lte('date', options.endDate);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// Get single transaction
export const getTransaction = async (transactionId) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (error) throw error;
    return data;
};

// Create transaction
export const createTransaction = async (userId, transactionData) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            type: transactionData.type,
            amount: transactionData.amount,
            currency: 'INR', // Default currency
            date: transactionData.date,
            description: transactionData.description || null,
            wallet_id: transactionData.walletId || null,
            category_id: transactionData.categoryId || null,
            from_wallet_id: transactionData.fromWalletId || null,
            to_wallet_id: transactionData.toWalletId || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Update wallet balances
    if (transactionData.type === 'Income') {
        await updateWalletBalance(transactionData.walletId, transactionData.amount);
    } else if (transactionData.type === 'Expense') {
        await updateWalletBalance(transactionData.walletId, -transactionData.amount);
    } else if (transactionData.type === 'Transfer') {
        await updateWalletBalance(transactionData.fromWalletId, -transactionData.amount);
        await updateWalletBalance(transactionData.toWalletId, transactionData.amount);
    }

    return data;
};

// Update transaction
export const updateTransaction = async (transactionId, updates) => {
    // Get original transaction to reverse wallet balances
    const original = await getTransaction(transactionId);

    const { data, error } = await supabase
        .from('transactions')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

    if (error) throw error;

    // Reverse original balance changes
    if (original.type === 'Income') {
        await updateWalletBalance(original.wallet_id, -original.amount);
    } else if (original.type === 'Expense') {
        await updateWalletBalance(original.wallet_id, original.amount);
    } else if (original.type === 'Transfer') {
        await updateWalletBalance(original.from_wallet_id, original.amount);
        await updateWalletBalance(original.to_wallet_id, -original.amount);
    }

    // Apply new balance changes
    const updated = data;
    if (updated.type === 'Income') {
        await updateWalletBalance(updated.wallet_id, updated.amount);
    } else if (updated.type === 'Expense') {
        await updateWalletBalance(updated.wallet_id, -updated.amount);
    } else if (updated.type === 'Transfer') {
        await updateWalletBalance(updated.from_wallet_id, -updated.amount);
        await updateWalletBalance(updated.to_wallet_id, updated.amount);
    }

    return data;
};

// Delete transaction
export const deleteTransaction = async (transactionId) => {
    // Get transaction to reverse wallet balances
    const transaction = await getTransaction(transactionId);

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw error;

    // Reverse wallet balance changes
    if (transaction.type === 'Income') {
        await updateWalletBalance(transaction.wallet_id, -transaction.amount);
    } else if (transaction.type === 'Expense') {
        await updateWalletBalance(transaction.wallet_id, transaction.amount);
    } else if (transaction.type === 'Transfer') {
        await updateWalletBalance(transaction.from_wallet_id, transaction.amount);
        await updateWalletBalance(transaction.to_wallet_id, -transaction.amount);
    }
};

// Get transaction statistics
export const getTransactionStats = async (userId, startDate, endDate) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    const stats = {
        totalIncome: 0,
        totalExpense: 0,
        totalTransfer: 0,
        netIncome: 0,
        transactionCount: data.length,
    };

    data.forEach(tx => {
        if (tx.type === 'Income') {
            stats.totalIncome += parseFloat(tx.amount);
        } else if (tx.type === 'Expense') {
            stats.totalExpense += parseFloat(tx.amount);
        } else if (tx.type === 'Transfer') {
            stats.totalTransfer += parseFloat(tx.amount);
        }
    });

    stats.netIncome = stats.totalIncome - stats.totalExpense;

    return stats;
};

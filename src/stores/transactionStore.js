import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as transactionService from '../services/transaction.service';

export const useTransactionStore = create((set, get) => ({
    transactions: [],
    stats: null,
    isLoading: false,
    error: null,

    // Fetch transactions with optional filters
    fetchTransactions: async (options = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const transactions = await transactionService.getTransactions(user.id, options);
            set({ transactions, isLoading: false });
            return transactions;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch transaction statistics
    fetchStats: async (startDate, endDate) => {
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const stats = await transactionService.getTransactionStats(user.id, startDate, endDate);
            set({ stats });
            return stats;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Create transaction
    createTransaction: async (transactionData) => {
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const newTransaction = await transactionService.createTransaction(user.id, transactionData);
            set({ transactions: [newTransaction, ...get().transactions] });
            return newTransaction;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update transaction
    updateTransaction: async (transactionId, updates) => {
        try {
            const updatedTransaction = await transactionService.updateTransaction(transactionId, updates);
            set({
                transactions: get().transactions.map(tx =>
                    tx.id === transactionId ? updatedTransaction : tx
                ),
            });
            return updatedTransaction;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Delete transaction
    deleteTransaction: async (transactionId) => {
        try {
            await transactionService.deleteTransaction(transactionId);
            set({
                transactions: get().transactions.filter(tx => tx.id !== transactionId),
            });
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Filter helpers
    getTransactionsByType: (type) => {
        return get().transactions.filter(tx => tx.type === type);
    },

    getTransactionsByWallet: (walletId) => {
        return get().transactions.filter(tx =>
            tx.wallet_id === walletId ||
            tx.from_wallet_id === walletId ||
            tx.to_wallet_id === walletId
        );
    },

    getTransactionsByCategory: (categoryId) => {
        return get().transactions.filter(tx => tx.category_id === categoryId);
    },
}));

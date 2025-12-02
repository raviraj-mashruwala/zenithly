import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as walletService from '../services/wallet.service';

export const useWalletStore = create((set, get) => ({
    wallets: [],
    isLoading: false,
    error: null,

    // Fetch all wallets
    fetchWallets: async () => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const wallets = await walletService.getWallets(user.id);
            set({ wallets, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch active wallets only
    fetchActiveWallets: async () => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const wallets = await walletService.getActiveWallets(user.id);
            set({ wallets, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Create wallet
    createWallet: async (walletData) => {
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const newWallet = await walletService.createWallet(user.id, user.email, walletData);
            set({ wallets: [...get().wallets, newWallet] });
            return newWallet;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update wallet
    updateWallet: async (walletId, updates) => {
        try {
            const updatedWallet = await walletService.updateWallet(walletId, updates);
            set({
                wallets: get().wallets.map(w =>
                    w.id === walletId ? updatedWallet : w
                ),
            });
            return updatedWallet;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Archive wallet
    archiveWallet: async (walletId) => {
        try {
            const archivedWallet = await walletService.archiveWallet(walletId);
            set({
                wallets: get().wallets.map(w =>
                    w.id === walletId ? archivedWallet : w
                ),
            });
            return archivedWallet;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Restore wallet
    restoreWallet: async (walletId) => {
        try {
            const restoredWallet = await walletService.restoreWallet(walletId);
            set({
                wallets: get().wallets.map(w =>
                    w.id === walletId ? restoredWallet : w
                ),
            });
            return restoredWallet;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Delete wallet
    deleteWallet: async (walletId) => {
        try {
            await walletService.deleteWallet(walletId);
            set({
                wallets: get().wallets.filter(w => w.id !== walletId),
            });
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Get total balance
    getTotalBalance: () => {
        const { wallets } = get();
        return walletService.calculateTotalBalance(wallets);
    },

    // Get active wallets from state
    getActiveWallets: () => {
        return get().wallets.filter(w => w.status === 'Active');
    },

    // Get archived wallets from state
    getArchivedWallets: () => {
        return get().wallets.filter(w => w.status === 'Archived');
    },
}));

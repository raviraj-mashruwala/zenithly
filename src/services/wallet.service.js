import { supabase } from '../lib/supabase';

// Ensure user profile exists (create if not)
const ensureUserProfile = async (userId, userEmail) => {
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (!existingUser) {
        // Create user profile
        const { error } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userEmail,
                display_name: userEmail.split('@')[0],
                base_currency: 'INR',
                locale: 'en-IN',
            });

        if (error) throw error;
    }
};

// Get all wallets for current user
export const getWallets = async (userId) => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Get active wallets only
export const getActiveWallets = async (userId) => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'Active')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Get single wallet by ID
export const getWallet = async (walletId) => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', walletId)
        .single();

    if (error) throw error;
    return data;
};

// Create new wallet
export const createWallet = async (userId, userEmail, walletData) => {
    // Ensure user profile exists first
    await ensureUserProfile(userId, userEmail);

    const { data, error } = await supabase
        .from('wallets')
        .insert({
            user_id: userId,
            name: walletData.name,
            type: walletData.type,
            icon_id: walletData.iconId || 'wallet',
            currency: walletData.currency,
            opening_balance: walletData.openingBalance || 0,
            current_balance: walletData.openingBalance || 0,
            included_in_total: walletData.includedInTotal !== false,
            status: 'Active',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update wallet
export const updateWallet = async (walletId, updates) => {
    const { data, error } = await supabase
        .from('wallets')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', walletId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Archive wallet (soft delete)
export const archiveWallet = async (walletId) => {
    const { data, error } = await supabase
        .from('wallets')
        .update({
            status: 'Archived',
            updated_at: new Date().toISOString(),
        })
        .eq('id', walletId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Restore archived wallet
export const restoreWallet = async (walletId) => {
    const { data, error } = await supabase
        .from('wallets')
        .update({
            status: 'Active',
            updated_at: new Date().toISOString(),
        })
        .eq('id', walletId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete wallet permanently
export const deleteWallet = async (walletId) => {
    // Check if wallet has transactions first
    const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .or(`wallet_id.eq.${walletId},from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`);

    if (countError) throw countError;

    if (count > 0) {
        throw new Error('Cannot delete wallet with existing transactions. Archive it instead.');
    }

    const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId);

    if (error) throw error;
};

// Calculate total balance across all included wallets
export const calculateTotalBalance = (wallets) => {
    return wallets
        .filter(wallet => wallet.included_in_total && wallet.status === 'Active')
        .reduce((total, wallet) => total + parseFloat(wallet.current_balance || 0), 0);
};

// Update wallet balance (used when transactions are added/edited/deleted)
export const updateWalletBalance = async (walletId, amount) => {
    // Get current balance
    const wallet = await getWallet(walletId);
    const newBalance = parseFloat(wallet.current_balance) + parseFloat(amount);

    return updateWallet(walletId, { current_balance: newBalance });
};

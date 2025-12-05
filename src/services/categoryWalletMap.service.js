import { supabase } from '../lib/supabase';

// Get all category-wallet mappings for a user
export const getCategoryWalletMappings = async (userId) => {
    const { data, error } = await supabase
        .from('category_wallet_map')
        .select(`
            *,
            categories!inner(user_id),
            wallets!inner(user_id)
        `)
        .or(`categories.user_id.eq.${userId},categories.user_id.is.null`);

    if (error) throw error;
    return data;
};

// Get active categories for a specific wallet
export const getActiveCategoriesForWallet = async (walletId) => {
    const { data, error } = await supabase
        .from('category_wallet_map')
        .select(`
            category_id,
            categories (*)
        `)
        .eq('wallet_id', walletId)
        .eq('active', true);

    if (error) throw error;
    return data?.map(m => m.categories) || [];
};

// Get activation count for a category (how many wallets it's active in)
export const getActivationCountForCategory = async (categoryId) => {
    const { count, error } = await supabase
        .from('category_wallet_map')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('active', true);

    if (error) throw error;
    return count || 0;
};

// Get wallet activation status for a category
export const getWalletActivationsForCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('category_wallet_map')
        .select(`
            *,
            wallets (id, name, icon_id, type)
        `)
        .eq('category_id', categoryId);

    if (error) throw error;
    return data || [];
};

// Toggle category activation for a specific wallet
export const toggleCategoryForWallet = async (categoryId, walletId, active) => {
    const { data, error } = await supabase
        .from('category_wallet_map')
        .update({
            active,
            updated_at: new Date().toISOString(),
        })
        .eq('category_id', categoryId)
        .eq('wallet_id', walletId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Upsert category activation for a wallet (create if not exists, update if exists)
export const upsertCategoryWalletMapping = async (categoryId, walletId, active = true) => {
    const { data, error } = await supabase
        .from('category_wallet_map')
        .upsert({
            category_id: categoryId,
            wallet_id: walletId,
            active,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'category_id,wallet_id'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Create mappings for a new category (activate for all existing wallets)
export const createMappingsForNewCategory = async (categoryId, userId) => {
    // Get all wallets for the user
    const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId);

    if (walletsError) throw walletsError;

    if (!wallets || wallets.length === 0) return [];

    // Create mappings for each wallet
    const mappings = wallets.map(wallet => ({
        category_id: categoryId,
        wallet_id: wallet.id,
        active: true,
    }));

    const { data, error } = await supabase
        .from('category_wallet_map')
        .insert(mappings)
        .select();

    if (error) throw error;
    return data;
};

// Create mappings for a new wallet (activate all existing categories)
export const createMappingsForNewWallet = async (walletId, userId) => {
    // Get all categories for the user
    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .or(`user_id.eq.${userId},user_id.is.null`);

    if (categoriesError) throw categoriesError;

    if (!categories || categories.length === 0) return [];

    // Create mappings for each category
    const mappings = categories.map(category => ({
        category_id: category.id,
        wallet_id: walletId,
        active: true,
    }));

    const { data, error } = await supabase
        .from('category_wallet_map')
        .insert(mappings)
        .select();

    if (error) throw error;
    return data;
};

// Bulk update category activations for multiple wallets
export const bulkUpdateCategoryActivations = async (categoryId, walletActivations) => {
    // walletActivations: [{ walletId, active }, ...]
    const updates = walletActivations.map(async ({ walletId, active }) => {
        return toggleCategoryForWallet(categoryId, walletId, active);
    });

    return Promise.all(updates);
};

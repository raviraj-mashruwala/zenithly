import { supabase } from '../lib/supabase';
import { createMappingsForNewWallet } from './categoryWalletMap.service';

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

    // RESTORE DEFAULT CATEGORIES IF NONE EXIST
    try {
        const { count, error: countError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (!countError && count === 0) {
            console.log('User has no categories. Restoring defaults...');
            const { DEFAULT_CATEGORIES } = await import('../constants/defaultCategories');
            
            // Flatten all default categories into one array
            const allDefaults = [
                ...DEFAULT_CATEGORIES.expense,
                ...DEFAULT_CATEGORIES.income,
                ...DEFAULT_CATEGORIES.debtLoan || []
            ];

            const categoriesToInsert = allDefaults.map(cat => ({
                user_id: userId,
                name: cat.name,
                type: cat.type,
                icon_id: cat.iconId,
                is_active_global: true,
                parent_category_id: null
            }));

            const { error: insertError } = await supabase
                .from('categories')
                .insert(categoriesToInsert);

            if (insertError) console.error('Failed to restore default categories:', insertError);
            else console.log('Default categories restored successfully.');
        }
    } catch (seedError) {
        console.error('Error checking/seeding categories:', seedError);
    }

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

    // Create category-wallet mappings for all existing categories
    try {
        await createMappingsForNewWallet(data.id, userId);
    } catch (mappingError) {
        console.error('Failed to create category mappings for new wallet:', mappingError);
        // Don't throw - wallet was created successfully
    }

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
// Helper to timeout a promise
const withTimeout = (promise, ms, label) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        )
    ]);
};

// Delete wallet permanently and all associated data
// Delete wallet permanently and all associated data
// Helper to delete in batches to avoid trigger deadlocks
const deleteInBatches = async (table, criteriaField, criteriaValue, batchSize = 20) => {
    let hasMore = true;
    let totalDeleted = 0;
    
    while (hasMore) {
        // Fetch a batch of IDs
        const { data: items, error: fetchError } = await supabase
            .from(table)
            .select('id')
            .eq(criteriaField, criteriaValue)
            .limit(batchSize);
            
        if (fetchError) throw fetchError;
        
        if (!items || items.length === 0) {
            hasMore = false;
            break;
        }
        
        const ids = items.map(i => i.id);
        
        // Delete this batch
        const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .in('id', ids);
            
        if (deleteError) throw deleteError;
        
        totalDeleted += ids.length;
        console.log(`...deleted batch of ${ids.length} items from ${table} (Total: ${totalDeleted})`);
        
        // Safety break if infinite loop (unlikely but good practice)
        if (totalDeleted > 10000) {
            console.warn('Batch delete safety limit reached');
            break;
        }
    }
};

// Delete wallet permanently and all associated data
export const deleteWallet = async (walletId) => {
    console.log(`Starting explicit cascade delete for wallet ${walletId}...`);
    
    // Increased timeout to 60s for batch operations
    const deleteOperation = async () => {
        // PRE-CHECK: Is this the user's last wallet?
        let isLastWallet = false;
        let userId = null;
        
        try {
            console.log('Pre-check: Getting current user...');
            const { data: { user }, error: uError } = await supabase.auth.getUser();
            
            if (uError || !user) {
                console.warn('Could not get auth user for wallet check', uError);
            } else {
                userId = user.id;
                console.log('Pre-check: Counting user wallets...');
                
                const { count, error: cError } = await supabase
                    .from('wallets')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);
                
                if (cError) {
                    console.error('Error counting wallets:', cError);
                } else {
                    isLastWallet = (count === 1);
                    console.log(`Wallet check: User ${userId} has ${count} wallets. Is last? ${isLastWallet}`);
                }
            }

        } catch (checkError) {
            console.error('Error in pre-check block:', checkError);
        }

        // 1. Delete transactions where this wallet is the PRIMARY wallet
        try {
            console.log('Step 1: Deleting primary transactions (batched)...');
            await deleteInBatches('transactions', 'wallet_id', walletId);
        } catch (e) {
            console.error('Failed deleting primary transactions', e);
            throw e;
        }

        // 2. Delete transactions where this wallet is the FROM wallet (transfers)
        try {
            console.log('Step 2: Deleting outgoing transfers (batched)...');
            await deleteInBatches('transactions', 'from_wallet_id', walletId);
        } catch (e) {
            console.error('Failed deleting outgoing transfers', e);
            throw e;
        }

        // 3. Delete transactions where this wallet is the TO wallet (transfers)
        try {
            console.log('Step 3: Deleting incoming transfers (batched)...');
            await deleteInBatches('transactions', 'to_wallet_id', walletId);
        } catch (e) {
            console.error('Failed deleting incoming transfers', e);
            throw e;
        }

        // 4. Delete category mappings
        try {
             console.log('Step 4: Deleting category mappings...');
            const { error: mapError } = await supabase
                .from('category_wallet_map')
                .delete()
                .eq('wallet_id', walletId);
            if (mapError) throw mapError;
        } catch (e) {
            console.error('Failed deleting category mappings', e);
            throw e;
        }

        // SPECIAL STEP: If last wallet, delete all categories for user
        if (isLastWallet && userId) {
            try {
                console.log('SPECIAL Step: Deleting all categories for user (last wallet)...');
                const { error: catError } = await supabase
                    .from('categories')
                    .delete()
                    .eq('user_id', userId);
                
                if (catError) {
                    console.error('Error deleting categories:', catError);
                } else {
                    console.log('All user categories deleted successfully.');
                }
            } catch (e) {
                console.error('Failed special category deletion step', e);
            }
        }

        // 5. Delete the wallet itself
        try {
            console.log('Step 5: Deleting wallet record...');
            const { error } = await supabase
                .from('wallets')
                .delete()
                .eq('id', walletId);
            if (error) throw error;
        } catch (e) {
             console.error('Failed deleting wallet record', e);
            throw e;
        }
        
        console.log('Wallet deletion sequence completed successfully.');
    };

    // Execute with a generous timeout of 60 seconds for batching
    await withTimeout(deleteOperation(), 60000, 'Wallet Deletion');
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

import { supabase } from '../lib/supabase';

// Get all categories for current user (including system defaults)
export const getCategories = async (userId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Get categories by type
export const getCategoriesByType = async (userId, type) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('type', type)
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

// Get active categories only
export const getActiveCategories = async (userId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Create new category
export const createCategory = async (userId, categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            user_id: userId,
            name: categoryData.name,
            type: categoryData.type,
            icon_id: categoryData.iconId || 'circle',
            is_active: true,
            applicable_wallet_ids: categoryData.applicableWalletIds || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update category
export const updateCategory = async (categoryId, updates) => {
    const { data, error } = await supabase
        .from('categories')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Deactivate category (soft delete)
export const deactivateCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('categories')
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Activate category
export const activateCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('categories')
        .update({
            is_active: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete category permanently
export const deleteCategory = async (categoryId) => {
    // Check if category has transactions first
    const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

    if (countError) throw countError;

    if (count > 0) {
        throw new Error('Cannot delete category with existing transactions. Deactivate it instead.');
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) throw error;
};

// Seed default categories for a user
export const seedDefaultCategories = async (userId, defaultCategories) => {
    const categoriesToInsert = defaultCategories.map(cat => ({
        user_id: userId,
        name: cat.name,
        type: cat.type,
        icon_id: cat.iconId,
        is_active: true,
        applicable_wallet_ids: null,
    }));

    const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

    if (error) throw error;
    return data;
};

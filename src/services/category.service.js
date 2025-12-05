import { supabase } from '../lib/supabase';
import { createMappingsForNewCategory } from './categoryWalletMap.service';

// Get all categories for current user (including system defaults)
export const getCategories = async (userId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Get categories by type
export const getCategoriesByType = async (userId, type) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('type', type)
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

// Get active categories only (globally active)
export const getActiveCategories = async (userId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_active_global', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

// Get parent categories (categories that can be parents - those without a parent themselves)
export const getParentCategories = async (userId, type = null) => {
    let query = supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .is('parent_category_id', null)
        .eq('is_active_global', true);

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return data;
};

// Get category with full hierarchy info
export const getCategoryWithHierarchy = async (categoryId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*, parent:parent_category_id(id, name, icon_id, type)')
        .eq('id', categoryId)
        .single();

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
            parent_category_id: categoryData.parentCategoryId || null,
            is_active_global: true,
        })
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .single();

    if (error) throw error;

    // Create wallet mappings for the new category
    try {
        await createMappingsForNewCategory(data.id, userId);
    } catch (mappingError) {
        console.error('Failed to create wallet mappings:', mappingError);
        // Don't throw - category was created successfully
    }

    return data;
};

// Update category
export const updateCategory = async (categoryId, updates) => {
    // If setting a parent, validate single-level hierarchy
    if (updates.parent_category_id) {
        // Check if this category has children - can't become a child if it has children
        const { count: childCount, error: childError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('parent_category_id', categoryId);

        if (childError) throw childError;

        if (childCount > 0) {
            throw new Error('Cannot set parent for a category that has child categories. Only single-level hierarchy is allowed.');
        }
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.icon_id !== undefined) updateData.icon_id = updates.icon_id;
    if (updates.parent_category_id !== undefined) updateData.parent_category_id = updates.parent_category_id;
    if (updates.is_active_global !== undefined) updateData.is_active_global = updates.is_active_global;

    const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .single();

    if (error) throw error;
    return data;
};

// Deactivate category globally (soft delete)
export const deactivateCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('categories')
        .update({
            is_active_global: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select('*, parent:parent_category_id(id, name, icon_id)')
        .single();

    if (error) throw error;
    return data;
};

// Activate category globally
export const activateCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('categories')
        .update({
            is_active_global: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select('*, parent:parent_category_id(id, name, icon_id)')
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
        throw new Error('Cannot delete category with existing transactions. Deactivate or merge it instead.');
    }

    // Check if category has child categories
    const { count: childCount, error: childError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_category_id', categoryId);

    if (childError) throw childError;

    if (childCount > 0) {
        throw new Error('Cannot delete category with child categories. Remove or reassign child categories first.');
    }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

    if (error) throw error;
};

// Merge source category into target category
export const mergeCategories = async (sourceCategoryId, targetCategoryId) => {
    // Verify both categories exist and are of the same type
    const { data: sourceCategory, error: sourceError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', sourceCategoryId)
        .single();

    if (sourceError) throw sourceError;

    const { data: targetCategory, error: targetError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', targetCategoryId)
        .single();

    if (targetError) throw targetError;

    if (sourceCategory.type !== targetCategory.type) {
        throw new Error('Cannot merge categories of different types');
    }

    // Update all transactions from source to target category
    const { error: updateError } = await supabase
        .from('transactions')
        .update({
            category_id: targetCategoryId,
            updated_at: new Date().toISOString(),
        })
        .eq('category_id', sourceCategoryId);

    if (updateError) throw updateError;

    // Move any child categories from source to target
    const { error: childUpdateError } = await supabase
        .from('categories')
        .update({
            parent_category_id: targetCategoryId,
            updated_at: new Date().toISOString(),
        })
        .eq('parent_category_id', sourceCategoryId);

    if (childUpdateError) throw childUpdateError;

    // Archive the source category (set is_active_global = false)
    const { data: archivedCategory, error: archiveError } = await supabase
        .from('categories')
        .update({
            is_active_global: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', sourceCategoryId)
        .select()
        .single();

    if (archiveError) throw archiveError;

    return {
        source: archivedCategory,
        target: targetCategory,
    };
};

// Get transaction count for a category
export const getCategoryTransactionCount = async (categoryId) => {
    const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

    if (error) throw error;
    return count || 0;
};

// Seed default categories for a user
export const seedDefaultCategories = async (userId, defaultCategories) => {
    const categoriesToInsert = defaultCategories.map(cat => ({
        user_id: userId,
        name: cat.name,
        type: cat.type,
        icon_id: cat.iconId,
        is_active_global: true,
        parent_category_id: null,
    }));

    const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

    if (error) throw error;

    // Create wallet mappings for each new category
    try {
        for (const category of data) {
            await createMappingsForNewCategory(category.id, userId);
        }
    } catch (mappingError) {
        console.error('Failed to create wallet mappings for default categories:', mappingError);
    }

    return data;
};

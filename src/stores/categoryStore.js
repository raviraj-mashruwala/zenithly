import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as categoryService from '../services/category.service';
import * as categoryWalletMapService from '../services/categoryWalletMap.service';

export const useCategoryStore = create((set, get) => ({
    categories: [],
    categoryWalletMappings: [],
    isLoading: false,
    error: null,

    // Fetch all categories
    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const categories = await categoryService.getCategories(user.id);
            set({ categories, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch categories by type
    fetchCategoriesByType: async (type) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const categories = await categoryService.getCategoriesByType(user.id, type);
            set({ categories, isLoading: false });
            return categories;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch parent categories (for dropdown)
    fetchParentCategories: async (type = null) => {
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            return await categoryService.getParentCategories(user.id, type);
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Create category
    createCategory: async (categoryData) => {
        try {
            const { user } = useAuthStore.getState();
            if (!user) throw new Error('Not authenticated');

            const newCategory = await categoryService.createCategory(user.id, categoryData);
            set({ categories: [...get().categories, newCategory] });
            return newCategory;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Update category
    updateCategory: async (categoryId, updates) => {
        try {
            const updatedCategory = await categoryService.updateCategory(categoryId, updates);
            set({
                categories: get().categories.map(c =>
                    c.id === categoryId ? updatedCategory : c
                ),
            });
            return updatedCategory;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Deactivate category globally
    deactivateCategory: async (categoryId) => {
        try {
            const deactivatedCategory = await categoryService.deactivateCategory(categoryId);
            set({
                categories: get().categories.map(c =>
                    c.id === categoryId ? deactivatedCategory : c
                ),
            });
            return deactivatedCategory;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Activate category globally
    activateCategory: async (categoryId) => {
        try {
            const activatedCategory = await categoryService.activateCategory(categoryId);
            set({
                categories: get().categories.map(c =>
                    c.id === categoryId ? activatedCategory : c
                ),
            });
            return activatedCategory;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Delete category
    deleteCategory: async (categoryId) => {
        try {
            await categoryService.deleteCategory(categoryId);
            set({
                categories: get().categories.filter(c => c.id !== categoryId),
            });
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Merge categories
    mergeCategories: async (sourceCategoryId, targetCategoryId) => {
        try {
            const result = await categoryService.mergeCategories(sourceCategoryId, targetCategoryId);
            // Update the source category as archived in the store
            set({
                categories: get().categories.map(c =>
                    c.id === sourceCategoryId ? { ...c, is_active_global: false } : c
                ),
            });
            return result;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Get transaction count for a category
    getCategoryTransactionCount: async (categoryId) => {
        try {
            return await categoryService.getCategoryTransactionCount(categoryId);
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ==== Wallet Activation Methods ====

    // Fetch wallet activations for a category
    fetchWalletActivationsForCategory: async (categoryId) => {
        try {
            return await categoryWalletMapService.getWalletActivationsForCategory(categoryId);
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Get activation count for a category
    getActivationCount: async (categoryId) => {
        try {
            return await categoryWalletMapService.getActivationCountForCategory(categoryId);
        } catch (error) {
            set({ error: error.message });
            return 0;
        }
    },

    // Toggle category for a wallet
    toggleCategoryForWallet: async (categoryId, walletId, active) => {
        try {
            return await categoryWalletMapService.toggleCategoryForWallet(categoryId, walletId, active);
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Bulk update category activations
    bulkUpdateCategoryActivations: async (categoryId, walletActivations) => {
        try {
            return await categoryWalletMapService.bulkUpdateCategoryActivations(categoryId, walletActivations);
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Get active categories for a specific wallet
    getActiveCategoriesForWallet: async (walletId) => {
        try {
            return await categoryWalletMapService.getActiveCategoriesForWallet(walletId);
        } catch (error) {
            set({ error: error.message });
            return [];
        }
    },

    // ==== Selector Methods ====

    // Get categories by type from state
    getCategoriesByType: (type) => {
        return get().categories.filter(c => c.type === type);
    },

    // Get active categories from state (globally active)
    getActiveCategories: () => {
        return get().categories.filter(c => c.is_active_global);
    },

    // Get inactive categories from state (globally inactive)
    getInactiveCategories: () => {
        return get().categories.filter(c => !c.is_active_global);
    },

    // Get parent categories from state
    getParentCategoriesFromState: (type = null) => {
        let cats = get().categories.filter(c => !c.parent_category_id && c.is_active_global);
        if (type) {
            cats = cats.filter(c => c.type === type);
        }
        return cats;
    },

    // Get child categories for a parent
    getChildCategories: (parentId) => {
        return get().categories.filter(c => c.parent_category_id === parentId);
    },

    // Get category hierarchy display name
    getCategoryDisplayName: (category) => {
        if (!category) return '';
        if (category.parent) {
            return `${category.parent.name} > ${category.name}`;
        }
        return category.name;
    },
}));

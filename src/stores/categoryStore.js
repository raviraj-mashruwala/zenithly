import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as categoryService from '../services/category.service';

export const useCategoryStore = create((set, get) => ({
    categories: [],
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

    // Deactivate category
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

    // Activate category
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

    // Get categories by type from state
    getCategoriesByType: (type) => {
        return get().categories.filter(c => c.type === type);
    },

    // Get active categories from state
    getActiveCategories: () => {
        return get().categories.filter(c => c.is_active);
    },

    // Get inactive categories from state
    getInactiveCategories: () => {
        return get().categories.filter(c => !c.is_active);
    },
}));

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    // Initialize auth state
    initialize: async () => {
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                set({
                    session,
                    user: session.user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                    isAuthenticated: !!session,
                });
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
        }
    },

    // Sign up with email and password
    signUp: async (email, password, displayName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });

        if (error) throw error;
        return data;
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    // Sign in with Google OAuth
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) throw error;
        return data;
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({
            user: null,
            session: null,
            isAuthenticated: false,
        });
    },

    // Send password reset email
    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
    },

    // Update password
    updatePassword: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
    },

    // Update user profile
    updateProfile: async (updates) => {
        const { error } = await supabase.auth.updateUser({
            data: updates,
        });

        if (error) throw error;

        // Refresh session to get updated user data
        const { data: { session } } = await supabase.auth.getSession();
        set({
            session,
            user: session?.user ?? null,
        });
    },
}));

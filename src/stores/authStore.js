import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isProfileComplete: false,

    // Initialize auth state
    initialize: async () => {
        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Auth initialization timed out')), 10000)
            );

            const initPromise = (async () => {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Fetch profile from public.users
                    const { data: profile } = await supabase
                        .from('users')
                        .select('display_name, avatar_icon, id')
                        .eq('id', session.user.id)
                        .single();

                    // Merge public profile into user object for compatibility
                    const enhancedUser = {
                        ...session.user,
                        user_metadata: {
                            ...session.user.user_metadata,
                            display_name: profile?.display_name || session.user.user_metadata?.display_name,
                            avatar_icon: profile?.avatar_icon || session.user.user_metadata?.avatar_icon,
                        }
                    };

                    set({
                        session,
                        user: enhancedUser,
                        isAuthenticated: true,
                        isProfileComplete: !!profile?.display_name, // Basic check
                        isLoading: false,
                    });
                } else {
                    set({ isLoading: false });
                }

                supabase.auth.onAuthStateChange(async (_event, session) => {
                    let enhancedUser = session?.user || null;
                    let isProfileComplete = false;
                    
                    if (session?.user) {
                         const { data: profile } = await supabase
                            .from('users')
                            .select('display_name, avatar_icon')
                            .eq('id', session.user.id)
                            .single();
                         
                         if (profile) {
                             enhancedUser = {
                                 ...session.user,
                                 user_metadata: {
                                     ...session.user.user_metadata,
                                     display_name: profile.display_name,
                                     avatar_icon: profile.avatar_icon,
                                 }
                             };
                             isProfileComplete = !!profile.display_name;
                         }
                    }

                    set({
                        session,
                        user: enhancedUser,
                        isAuthenticated: !!session,
                        isProfileComplete,
                    });
                });
            })();

            await Promise.race([initPromise, timeoutPromise]);

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
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) throw error;

        // If we get a session immediately (email confirmation disabled), update state
        if (data.session) {
            set({
                session: data.session,
                user: data.session.user,
                isAuthenticated: true,
                isLoading: false,
            });
        }

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

    // Update user profile (Public Table + Optimistic)
    updateProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        console.log('authStore: starting optimistic update (public table)', updates);

        // 1. Optimistic update
        const updatedMetadata = { 
            ...currentUser.user_metadata, 
            ...updates 
        };
        const optimisticallyUpdatedUser = {
            ...currentUser,
            user_metadata: updatedMetadata
        };

        set({ user: optimisticallyUpdatedUser });

        try {
            // 2. Perform network update to public.users table
            console.log('authStore: upserting to public.users...');
            
            const { error: dbError } = await supabase
                .from('users')
                .upsert({
                    id: currentUser.id,
                    email: currentUser.email, // Required for new rows
                    display_name: updates.display_name,
                    avatar_icon: updates.avatar_icon,
                    updated_at: new Date().toISOString(), 
                }, { onConflict: 'id' });

            if (dbError) {
                console.error('authStore: DB update failed', dbError);
                throw dbError;
            }

            console.log('authStore: DB update successful');
            
            // 3. Optional: Try to update Auth Metadata too (fire and forget)
            // This keeps auth.users in sync if it ever starts working, but we don't await it strictly
            supabase.auth.updateUser({ data: updates }).catch(e => console.warn('Auth meta update failed', e));

        } catch (err) {
            console.error('authStore: update error', err);
            set({ user: currentUser }); // Revert
            throw err;
        }
    },
}));

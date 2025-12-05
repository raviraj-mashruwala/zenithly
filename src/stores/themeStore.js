import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'dark', // 'dark' or 'light'

            setTheme: (theme) => {
                set({ theme });
                document.documentElement.setAttribute('data-theme', theme);
            },

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                set({ theme: newTheme });
                document.documentElement.setAttribute('data-theme', newTheme);
            },

            initTheme: () => {
                const { theme } = get();
                document.documentElement.setAttribute('data-theme', theme);
            },
        }),
        {
            name: 'zenithly-theme',
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state?.theme) {
                    document.documentElement.setAttribute('data-theme', state.theme);
                }
            },
        }
    )
);

export { useThemeStore };

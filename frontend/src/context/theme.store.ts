import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,

  initialize: () => {
    const stored = localStorage.getItem('devintel-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    set({ isDark });
  },

  toggle: () => {
    set((state) => {
      const newValue = !state.isDark;
      localStorage.setItem('devintel-theme', newValue ? 'dark' : 'light');
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: newValue };
    });
  },

  setDark: (value: boolean) => {
    localStorage.setItem('devintel-theme', value ? 'dark' : 'light');
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDark: value });
  },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeStore = {
	theme: string;
	setTheme: (theme: string) => void;
	toggleTheme: () => void;
};

export const themeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: "light",
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set(({ theme }) => ({ theme: theme === "light" ? "dark" : "light" })),
		}),
		{
			name: "theme",
			version: 1.0,
		},
	),
);

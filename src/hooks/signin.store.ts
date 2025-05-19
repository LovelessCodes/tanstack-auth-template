import { create } from "zustand";

type SigninStore = {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
};

export const signinStore = create<SigninStore>()((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
	toggle: () => set((state) => ({ open: !state.open })),
}));

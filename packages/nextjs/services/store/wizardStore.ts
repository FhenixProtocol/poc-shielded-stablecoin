import { create } from "zustand";

interface WizardState {
  name: string;
  symbol: string;
  decimals: number;
  isShielded: boolean;
  setName: (name: string) => void;
  setSymbol: (symbol: string) => void;
  setDecimals: (decimals: number) => void;
  setIsShielded: (isShielded: boolean) => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  name: "Fhenix USD",
  symbol: "FUSD",
  decimals: 18,
  isShielded: true,
  setName: (name) => set({ name }),
  setSymbol: (symbol) => set({ symbol }),
  setDecimals: (decimals) => set({ decimals }),
  setIsShielded: (isShielded) => set({ isShielded }),
}));


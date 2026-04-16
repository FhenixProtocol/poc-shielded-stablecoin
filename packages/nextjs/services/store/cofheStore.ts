import { create } from "zustand";

interface CofheState {
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
  balanceUpdateTrigger: number;
  triggerBalanceUpdate: () => void;
  // Counter to trigger UI refresh when permits change
  permitVersion: number;
  bumpPermitVersion: () => void;
}

export const useCofheStore = create<CofheState>((set) => ({
  isInitialized: false,
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  balanceUpdateTrigger: 0,
  triggerBalanceUpdate: () =>
    set((state) => ({
      balanceUpdateTrigger: state.balanceUpdateTrigger + 1,
    })),
  permitVersion: 0,
  bumpPermitVersion: () =>
    set((state) => ({ permitVersion: state.permitVersion + 1 })),
}));

import { create } from "zustand";

export type TabType = "issuer" | "user";
export type UserSubTab = "tokens" | "interact";

interface NavigationState {
  activeTab: TabType;
  userSubTab: UserSubTab;
  selectedTokenAddress: string | null;
  setActiveTab: (tab: TabType) => void;
  setUserSubTab: (subTab: UserSubTab) => void;
  setSelectedTokenAddress: (address: string | null) => void;
  navigateToInteractWithToken: (tokenAddress: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: "issuer",
  userSubTab: "tokens",
  selectedTokenAddress: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setUserSubTab: (subTab) => set({ userSubTab: subTab }),
  setSelectedTokenAddress: (address) => set({ selectedTokenAddress: address }),
  navigateToInteractWithToken: (tokenAddress) =>
    set({
      activeTab: "user",
      userSubTab: "interact",
      selectedTokenAddress: tokenAddress,
    }),
}));



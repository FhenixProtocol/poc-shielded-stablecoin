import { create } from "zustand";

export type TabType = "issuer" | "user";
export type UserSubTab = "tokens" | "interact";

interface NavigationState {
  activeTab: TabType;
  userSubTab: UserSubTab;
  setActiveTab: (tab: TabType) => void;
  setUserSubTab: (subTab: UserSubTab) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: "issuer",
  userSubTab: "tokens",
  setActiveTab: (tab) => set({ activeTab: tab }),
  setUserSubTab: (subTab) => set({ userSubTab: subTab }),
}));



import { create } from "zustand";

export type TabType = "create" | "manage" | "interact";

interface NavigationState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: "create",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));


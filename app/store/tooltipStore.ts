import { create } from "zustand";

interface TooltipState {
  isVisible: boolean;
  message: string;
  showTooltip: (message: string) => void;
  hideTooltip: () => void;
}

export const useTooltipStore = create<TooltipState>((set) => ({
  isVisible: false,
  message: "",
  showTooltip: (message) => set({ isVisible: true, message }),
  hideTooltip: () => set({ isVisible: false, message: "" }),
}));

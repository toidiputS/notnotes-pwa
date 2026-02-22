
import { createContext, useContext } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  showGlobalTrigger: boolean;
  setShowGlobalTrigger: (v: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  isSidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  showGlobalTrigger: true,
  setShowGlobalTrigger: () => {},
});

export const useLayout = () => useContext(LayoutContext);

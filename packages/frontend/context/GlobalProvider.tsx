"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface GlobalContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const defaultValue: GlobalContextType = {
  loading: false,
  setLoading: () => {
    // Default implementation - does nothing
  },
};

export const GlobalContext = createContext<GlobalContextType>(defaultValue);

/**
 * Custom hook to use GlobalContext
 * @returns GlobalContextType
 */
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

/**
 * GlobalProvider
 * @param param0
 * @returns
 */
export const GlobalProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("GlobalProvider loading state:", loading);
  }, [loading]);

  const global = {
    loading,
    setLoading,
  };

  return <GlobalContext.Provider value={global}>{children}</GlobalContext.Provider>;
};

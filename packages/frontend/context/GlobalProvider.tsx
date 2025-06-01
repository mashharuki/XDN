"use client";

import React, { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext<any>({});

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

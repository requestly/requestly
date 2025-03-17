import React, { ReactNode } from "react";
import { createTabServiceProvider } from "./tabServiceStore";

const providerFactory = createTabServiceProvider();

export const TabServiceProvider = ({ children }: { children: ReactNode }) => {
  const providerElement = providerFactory({ children });
  return React.createElement(providerElement.type, providerElement.props);
};

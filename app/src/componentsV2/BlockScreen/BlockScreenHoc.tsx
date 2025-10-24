import React from "react";
import { useIsUserBlocked } from "./hooks/useIsUserBlocked";
import { BlockScreen } from "./components/BlockScreen";

interface BlockScreenHocProps {
  children: React.ReactNode;
}

export const BlockScreenHoc: React.FC<BlockScreenHocProps> = ({ children }) => {
  const { isBlocked, blockConfig } = useIsUserBlocked();

  return isBlocked ? <BlockScreen blockConfig={blockConfig} /> : children;
};

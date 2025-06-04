import React from "react";
import { useIsGrrEnabled } from "features/grr/hooks/useIsGrrEnabled";
import { GrrWarningScreenContainer } from "features/grr/container";

interface GrrWarningHocProps {
  children: React.ReactNode;
}

export const GrrWarningHoc: React.FC<GrrWarningHocProps> = ({ children }) => {
  const { isGrrEnabled } = useIsGrrEnabled();

  return isGrrEnabled ? <GrrWarningScreenContainer /> : children;
};

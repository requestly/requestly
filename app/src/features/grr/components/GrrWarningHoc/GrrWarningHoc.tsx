import React from "react";
import { useIsGrr } from "features/grr/hooks/useIsGrr";
import { GrrWarningScreenContainer } from "features/grr/container";

interface GrrWarningHocProps {
  children: React.ReactNode;
}

export const GrrWarningHoc: React.FC<GrrWarningHocProps> = ({ children }) => {
  const { isGrr } = useIsGrr();

  return isGrr ? <GrrWarningScreenContainer /> : children;
};

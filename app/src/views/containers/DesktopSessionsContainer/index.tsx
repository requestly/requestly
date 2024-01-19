import React from "react";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";
import { useResetSecondarySidebarCollapse } from "../common/hooks/useResetSecondarySidebarCollapse";
import { DesktopSessionsSidebar } from "./DesktopSessionsSidebar";

export const DesktopSessionsContainer: React.FC = () => {
  useResetSecondarySidebarCollapse();

  return <ContainerWithSecondarySidebar sidebar={<DesktopSessionsSidebar />} />;
};

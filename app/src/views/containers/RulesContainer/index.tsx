import React from "react";
import { RulesSidebar } from "./RulesSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";
import { useResetSecondarySidebarCollapse } from "../common/hooks/useResetSecondarySidebarCollapse";

export const RulesContainer: React.FC = () => {
  useResetSecondarySidebarCollapse();

  return <ContainerWithSecondarySidebar sidebar={<RulesSidebar />} />;
};

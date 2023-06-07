import React from "react";
import { RulesSidebar } from "./RulesSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";

export const RulesContainer: React.FC = () => {
  return (
    <ContainerWithSecondarySidebar>
      <RulesSidebar />
    </ContainerWithSecondarySidebar>
  );
};

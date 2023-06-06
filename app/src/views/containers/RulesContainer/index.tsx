import React from "react";
import { RulesSidebar } from "./RulesSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";

export const RulesContainer: React.FC = () => {
  console.log({ location: window.location.href });

  return (
    <ContainerWithSecondarySidebar>
      <RulesSidebar />
    </ContainerWithSecondarySidebar>
  );
};

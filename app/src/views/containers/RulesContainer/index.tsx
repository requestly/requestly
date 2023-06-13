import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "store";
import { RulesSidebar } from "./RulesSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";

export const RulesContainer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.updateSecondarySidebarCollapse(false));
  }, [dispatch]);

  return <ContainerWithSecondarySidebar sidebar={<RulesSidebar />} />;
};

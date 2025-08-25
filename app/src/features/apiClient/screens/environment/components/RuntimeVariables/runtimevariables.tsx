import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import React, { useEffect } from "react";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";
import "./runtimevariables.scss";

export const RuntimeVariables: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  useEffect(() => {
    openTab(new RuntimeVariablesViewTabSource());
  }, [openTab]);

  return (
    <div className="runtime-variables-container" onClick={() => openTab(new RuntimeVariablesViewTabSource())}>
      <div className="runtime-variables-text-placeholder">
        <span className="text">Runtime variables</span>
      </div>
    </div>
  );
};

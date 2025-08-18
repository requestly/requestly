import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import React from "react";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";
import "./runtimevariables.scss";

export const RuntimeVariables: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  return (
    <div
      className="runtime-variables-container"
      onClick={() => {
        openTab(new RuntimeVariablesViewTabSource());
      }}
    >
      <div className="runtime-variables-text-placeholder">
        <span className="text">Runtime variables</span>
      </div>
    </div>
  );
};

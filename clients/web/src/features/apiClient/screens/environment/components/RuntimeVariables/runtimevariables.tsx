import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import React, { useEffect, useMemo } from "react";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";
import "./runtimevariables.scss";

const tabSource = {
  RUNTIME_VARIABLES: "runtime",
};

export const RuntimeVariables: React.FC = () => {
  const [openTab, activeTabSource] = useTabServiceWithSelector((state) => [state.openTab, state.activeTabSource]);

  useEffect(() => {
    openTab(new RuntimeVariablesViewTabSource());
  }, [openTab]);

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  return (
    <div className="runtime-variables-container" onClick={() => openTab(new RuntimeVariablesViewTabSource())}>
      <div
        className={`runtime-variables-text-placeholder ${
          activeTabSourceId === tabSource.RUNTIME_VARIABLES ? "active" : ""
        }`}
      >
        <span className="text">Runtime variables</span>
      </div>
    </div>
  );
};

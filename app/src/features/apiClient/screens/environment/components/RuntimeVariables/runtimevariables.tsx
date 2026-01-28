import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";
import "./runtimevariables.scss";
import { useTabActions, selectActiveTab } from "componentsV2/Tabs/slice";
import { RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";

export const RuntimeVariables: React.FC = () => {
  const activeTab = useSelector(selectActiveTab);
  const { openBufferedTab } = useTabActions();

  const activeTabSourceId = useMemo(() => {
    if (activeTab) {
      return activeTab.source.getSourceId();
    }
  }, [activeTab]);

  const handleTabOpen = () => {
    openBufferedTab({
      source: new RuntimeVariablesViewTabSource({
        id: RUNTIME_VARIABLES_ENTITY_ID,
        title: "Runtime Variables",
        context: {},
      }),
    });
  };

  useEffect(() => {
    handleTabOpen();
  }, []);

  return (
    <div className="runtime-variables-container" onClick={handleTabOpen}>
      <div
        className={`runtime-variables-text-placeholder ${
          activeTabSourceId === RUNTIME_VARIABLES_ENTITY_ID ? "active" : ""
        }`}
      >
        <span className="text">Runtime variables</span>
      </div>
    </div>
  );
};

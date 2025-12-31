import { useMemo } from "react";
import type { FC } from "react";
import { useSelector } from "react-redux";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";
import "./runtimevariables.scss";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useTabActions, selectActiveTab } from "componentsV2/Tabs/slice";

const tabSource = {
  RUNTIME_VARIABLES: "runtime",
};

export const RuntimeVariables: FC = () => {
  const workspaceId = useWorkspaceId();
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
        id: tabSource.RUNTIME_VARIABLES,
        title: "Runtime Variables",
        context: {
          id: workspaceId,
        },
      }),
    });
  };

  return (
    <div className="runtime-variables-container" onClick={handleTabOpen}>
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

import React from "react";
import { RQAPI } from "../../../../types";
import { ApiClientSidebarTabs } from "./apiClientSidebarTabs/ApiClientSidebarTabs";
import "./apiClientSidebar.scss";

interface Props {
  history: RQAPI.Entry[];
  onSelectionFromHistory: (index: number) => void;
  clearHistory: () => void;
  onNewClick: () => void;
  onImportClick: () => void;
}

const APIClientSidebar: React.FC<Props> = ({
  history,
  onSelectionFromHistory,
  clearHistory,
  onNewClick,
  onImportClick,
}) => {
  return (
    <div className="api-client-sidebar">
      <ApiClientSidebarTabs
        history={history}
        onSelectionFromHistory={onSelectionFromHistory}
        clearHistory={clearHistory}
        onNewClick={onNewClick}
        onImportClick={onImportClick}
      />
    </div>
  );
};

export default APIClientSidebar;

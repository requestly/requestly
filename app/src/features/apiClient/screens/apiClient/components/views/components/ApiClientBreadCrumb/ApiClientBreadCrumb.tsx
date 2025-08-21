import React from "react";
import { Conditional } from "components/common/Conditional";
import PATHS from "config/constants/sub/paths";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useLocation } from "react-router-dom";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { LuFolderCog } from "@react-icons/all-files/lu/LuFolderCog";
import "./ApiClientBreadCrumb.scss";
import { truncateString } from "features/apiClient/screens/apiClient/utils";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { Tooltip } from "antd";
interface Props {
  id: string;
  openInModal?: boolean;
  autoFocus?: boolean;
  name?: string;
  OnRecordNameUpdate: (name: string) => void;
  onBlur: (name: string) => void;
}

export const ApiClientBreadCrumb: React.FC<Props> = ({
  id,
  openInModal,
  autoFocus,
  name,
  OnRecordNameUpdate,
  onBlur,
}) => {
  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");
  const [getViewMode, getSelectedWorkspace] = useApiClientMultiWorkspaceView((s) => [
    s.getViewMode,
    s.getSelectedWorkspace,
  ]);

  const contextId = useContextId();

  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

  const currentWorkspace = getSelectedWorkspace(getContext(contextId).workspaceId);

  const localWsPath = currentWorkspace.getState().rawWorkspace.rootPath;
  const truncatePath = truncateString(localWsPath, 40);
  const [getParentChain, getData] = useAPIRecords((s) => [s.getParentChain, s.getData]);

  const collections = getParentChain(id);

  const parentRecords: string[] = [];
  collections
    .slice()
    .reverse()
    .forEach((id) => {
      parentRecords.push(getData(id).name);
    });

  const parentCollectionNames = parentRecords.map((p) => {
    return {
      label: p,
      pathname: "",
      isEditable: false,
    };
  });

  return (
    <Conditional condition={!openInModal}>
      {getViewMode() === ApiClientViewMode.SINGLE ? (
        <RQBreadcrumb
          placeholder="Untitled request"
          recordName={name}
          onRecordNameUpdate={OnRecordNameUpdate}
          onBlur={onBlur}
          autoFocus={autoFocus}
          defaultBreadcrumbs={[
            { label: "API Client", pathname: PATHS.API_CLIENT.INDEX },
            {
              isEditable: !isHistoryPath,
              pathname: window.location.pathname,
              label: isHistoryPath ? "History" : name || "Untitled request",
            },
          ]}
        />
      ) : (
        <RQBreadcrumb
          placeholder="Untitled request"
          recordName={name}
          onRecordNameUpdate={OnRecordNameUpdate}
          onBlur={onBlur}
          autoFocus={autoFocus}
          defaultBreadcrumbs={[
            {
              label: (
                <div>
                  <Tooltip trigger="hover" title={localWsPath} color="var(--requestly-color-black)" placement="bottom">
                    <span className="api-client-local-workspace-path-breadcrumb">
                      <LuFolderCog className="api-client-local-workspace-icon" />
                      {truncatePath + "/" + currentWorkspace.getState().name}
                    </span>
                  </Tooltip>
                </div>
              ),
              pathname: PATHS.API_CLIENT.INDEX,
              isEditable: false,
            },
            ...parentCollectionNames,
            {
              isEditable: !isHistoryPath,
              pathname: window.location.pathname,
              label: isHistoryPath ? "History" : name || "Untitled request",
            },
          ]}
        />
      )}
    </Conditional>
  );
};

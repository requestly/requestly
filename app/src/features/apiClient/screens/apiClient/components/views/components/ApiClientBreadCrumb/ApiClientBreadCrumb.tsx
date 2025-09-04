import React, { useCallback, useMemo } from "react";
import { Conditional } from "components/common/Conditional";
import PATHS from "config/constants/sub/paths";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useLocation } from "react-router-dom";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { LuFolderCog } from "@react-icons/all-files/lu/LuFolderCog";
import "./ApiClientBreadCrumb.scss";
import { truncateString } from "features/apiClient/screens/apiClient/utils";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { Tooltip } from "antd";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "types";

interface Props {
  id: string;
  openInModal?: boolean;
  autoFocus?: boolean;
  name?: string;
  placeholder: string;
  onRecordNameUpdate?: (name: string) => void;
  onBlur: (name: string) => void;
  breadCrumbType: string;
}

export const BreadcrumbType = {
  COLLECTION: "collection",
  API_REQUEST: "api_request",
};
export const MultiViewBreadCrumb: React.FC<Props> = ({ ...props }) => {
  const { id, autoFocus, name, onRecordNameUpdate, placeholder, onBlur, breadCrumbType } = props;

  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");
  const activeWorkspace = useSelector(getActiveWorkspace);
  const [getSelectedWorkspace, getViewMode] = useApiClientMultiWorkspaceView((s) => [
    s.getSelectedWorkspace,
    s.getViewMode,
  ]);

  const ctx = useApiClientFeatureContext();

  const currentWorkspacePath = useMemo(
    () =>
      getViewMode() === ApiClientViewMode.SINGLE
        ? activeWorkspace.rootPath
        : getSelectedWorkspace(ctx.workspaceId)?.getState().rawWorkspace.rootPath,
    [getSelectedWorkspace, ctx.workspaceId, getViewMode, activeWorkspace]
  );

  const [getParentChain, getData] = useAPIRecords((s) => [s.getParentChain, s.getData]);

  const truncatePath = truncateString(currentWorkspacePath, 40);

  const parentCollections = useMemo(
    () =>
      getParentChain(id)
        .map((item) => getData(item))
        .reverse(),
    [getParentChain, getData, id]
  );

  const handleBreadcrumbLabelClick = useCallback(
    (index: number) => {
      const pathItems = [currentWorkspacePath, ...parentCollections.map((item) => item.name)];
      const pathToOpen = pathItems.slice(0, index + 1).join("/");
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("open-path-in-file-manager", {
        path: pathToOpen,
      });
    },
    [currentWorkspacePath, parentCollections]
  );

  const parentCollectionNames = useMemo(() => {
    const parentRecords = parentCollections.slice().map((id) => {
      return {
        label: id.name,
        pathname: "",
        isEditable: false,
        onClick: handleBreadcrumbLabelClick,
      };
    });

    return parentRecords;
  }, [parentCollections, handleBreadcrumbLabelClick]);

  return (
    <RQBreadcrumb
      placeholder={placeholder}
      recordName={name}
      onRecordNameUpdate={onRecordNameUpdate}
      onBlur={onBlur}
      autoFocus={autoFocus}
      defaultBreadcrumbs={[
        {
          label: (
            <div>
              <Tooltip
                trigger="hover"
                title={currentWorkspacePath}
                color="var(--requestly-color-black)"
                placement="bottom"
              >
                <span className="api-client-local-workspace-path-breadcrumb">
                  <LuFolderCog className="api-client-local-workspace-icon" />
                  {truncatePath}
                </span>
              </Tooltip>
            </div>
          ),
          pathname: PATHS.API_CLIENT.INDEX,
          isEditable: false,
          onClick: handleBreadcrumbLabelClick,
        },
        ...parentCollectionNames,
        {
          isEditable: breadCrumbType === BreadcrumbType.API_REQUEST ? !isHistoryPath : true,
          pathname: window.location.pathname,
          label:
            breadCrumbType === BreadcrumbType.API_REQUEST
              ? isHistoryPath
                ? "History"
                : name || "Untitled request"
              : name,
        },
      ]}
    />
  );
};

export const ApiClientBreadCrumb: React.FC<Props> = ({ ...props }) => {
  const { openInModal, autoFocus, name, placeholder, onRecordNameUpdate, onBlur } = props;

  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  return (
    <Conditional condition={!openInModal}>
      {/* TODO: Need To decouple workspace type check from checkLocalSyncSupport hook */}
      {isLocalSyncEnabled && activeWorkspace?.workspaceType === WorkspaceType.LOCAL ? (
        <MultiViewBreadCrumb {...props} />
      ) : (
        <RQBreadcrumb
          placeholder={placeholder}
          recordName={name}
          onRecordNameUpdate={onRecordNameUpdate}
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
      )}
    </Conditional>
  );
};

import React, { useMemo } from "react";
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
  const [getSelectedWorkspace] = useApiClientMultiWorkspaceView((s) => [s.getSelectedWorkspace]);

  const ctx = useApiClientFeatureContext();

  const currentWorkspace = useMemo(() => getSelectedWorkspace(ctx.workspaceId), [
    getSelectedWorkspace,
    ctx.workspaceId,
  ]);

  const [getParentChain, getData] = useAPIRecords((s) => [s.getParentChain, s.getData]);

  const localWsPath = currentWorkspace?.getState()?.rawWorkspace?.rootPath ?? "";
  const truncatePath = truncateString(localWsPath, 40);

  const parentCollectionNames = useMemo(() => {
    const collections = getParentChain(id);

    const parentRecords = collections
      .slice()
      .reverse()
      .map((id) => {
        return {
          label: getData(id)?.name,
          pathname: "",
          isEditable: false,
        };
      });

    return parentRecords;
  }, [getData, getParentChain, id]);

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
            <Conditional condition={!!truncatePath}>
              <div>
                <Tooltip trigger="hover" title={localWsPath} color="var(--requestly-color-black)" placement="bottom">
                  <span className="api-client-local-workspace-path-breadcrumb">
                    <LuFolderCog className="api-client-local-workspace-icon" />
                    {truncatePath}
                  </span>
                </Tooltip>
              </div>
            </Conditional>
          ),
          pathname: PATHS.API_CLIENT.INDEX,
          isEditable: false,
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
  const [getViewMode] = useApiClientMultiWorkspaceView((s) => [s.getViewMode]);

  return (
    <Conditional condition={!openInModal}>
      {getViewMode() === ApiClientViewMode.SINGLE ? (
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
      ) : (
        <MultiViewBreadCrumb {...props} />
      )}
    </Conditional>
  );
};

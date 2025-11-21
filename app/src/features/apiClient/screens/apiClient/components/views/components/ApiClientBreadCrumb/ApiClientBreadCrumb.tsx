import React, { useEffect, useMemo, useState } from "react";
import { Conditional } from "components/common/Conditional";
import PATHS from "config/constants/sub/paths";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useLocation } from "react-router-dom";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./ApiClientBreadCrumb.scss";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { Typography } from "antd";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { FolderOutlined } from "@ant-design/icons";

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

export const MultiWorkSpaceViewBreadCrumb: React.FC<Props> = ({ ...props }) => {
  const { id, autoFocus, name, onRecordNameUpdate, placeholder, onBlur, breadCrumbType } = props;

  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");
  const [getSelectedWorkspace] = useApiClientMultiWorkspaceView((s) => [s.getSelectedWorkspace]);

  const ctx = useApiClientFeatureContext();

  const currentWorkspace = useMemo(() => getSelectedWorkspace(ctx.workspaceId), [
    getSelectedWorkspace,
    ctx.workspaceId,
  ]);

  const [getParentChain, getData, childParentMap] = useAPIRecords((s) => [
    s.getParentChain,
    s.getData,
    s.childParentMap,
  ]);

  const workspaceName = currentWorkspace?.getState().name;

  const [parentCollectionNames, setParentCollectionNames] = useState<[]>([]);

  useEffect(() => {
    const collections = getParentChain(id);

    const parentRecords = collections
      .slice()
      .reverse()
      .map((id) => {
        const item = getData(id);
        const path =
          item?.type === BreadcrumbType.COLLECTION
            ? `/api-client/collection/${item?.id}`
            : `/api-client/request/${item?.id}`;
        return {
          label: item?.name || "Untitled",
          pathname: path,
          isEditable: false,
        };
      });

    setParentCollectionNames(parentRecords);
  }, [getData, getParentChain, id, childParentMap]);

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
            <div className="workspace-breadcrumb-item">
              <Typography.Text
                className="api-client-local-workspace-breadcrumb"
                ellipsis={{
                  tooltip: {
                    title: workspaceName || "Workspace",
                    color: "var(--requestly-color-black)",
                    placement: "bottom",
                  },
                }}
              >
                <FolderOutlined className="api-client-local-workspace-icon" />
                <span>{workspaceName || "Workspace"}</span>
              </Typography.Text>
            </div>
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

const SingleWorkSpaceViewBreadCrumb: React.FC<Props> = ({ ...props }) => {
  const { id, autoFocus, name, onRecordNameUpdate, placeholder, onBlur, breadCrumbType } = props;
  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");

  const [getParentChain, getData, childParentMap] = useAPIRecords((s) => [
    s.getParentChain,
    s.getData,
    s.childParentMap,
  ]);

  const [parentCollectionNames, setParentCollectionNames] = useState<[]>([]);

  useEffect(() => {
    const collections = getParentChain(id);

    const parentRecords = collections
      .slice()
      .reverse()
      .map((id) => {
        const item = getData(id);
        const path =
          item?.type === BreadcrumbType.COLLECTION
            ? `/api-client/collection/${item?.id}`
            : `/api-client/request/${item?.id}`;
        return {
          label: item?.name || "Untitled Request",
          pathname: path,
          isEditable: false,
        };
      });

    setParentCollectionNames(parentRecords);
  }, [getData, getParentChain, id, childParentMap]);

  return (
    <RQBreadcrumb
      placeholder={placeholder}
      recordName={name}
      onRecordNameUpdate={onRecordNameUpdate}
      onBlur={onBlur}
      autoFocus={autoFocus}
      defaultBreadcrumbs={[
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
  const { openInModal } = props;

  const [getViewMode] = useApiClientMultiWorkspaceView((s) => [s.getViewMode]);

  return (
    <Conditional condition={!openInModal}>
      {getViewMode() === ApiClientViewMode.SINGLE ? (
        <SingleWorkSpaceViewBreadCrumb {...props} />
      ) : (
        <MultiWorkSpaceViewBreadCrumb {...props} />
      )}
    </Conditional>
  );
};

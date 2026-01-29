import React, { useMemo } from "react";
import { Breadcrumb } from "antd";
import { RequestExecutionResult } from "features/apiClient/slices/common/runResults/types";
import { getAncestorIds, getRecord } from "features/apiClient/slices/apiRecords/utils";
import { useTabActions } from "componentsV2/Tabs/slice";
import { RequestViewTabSource } from "../../../../../../RequestView/requestViewTabSource";

interface RequestBreadcrumbProps {
  requestExecutionResult: RequestExecutionResult;
  workspaceId: string;
  clickable?: boolean;
  showFullPath?: boolean;
  className?: string;
}

export const RequestBreadcrumb: React.FC<RequestBreadcrumbProps> = ({
  requestExecutionResult,
  workspaceId,
  clickable = false,
  showFullPath = true,
  className = "request-name-details-breadcrumb",
}) => {
  const { openBufferedTab } = useTabActions();

  const collectionPath = useMemo(() => {
    if (!workspaceId) return [];

    const ancestorIds = getAncestorIds(requestExecutionResult.recordId, workspaceId);
    return ancestorIds
      .slice(0, -1) // Exclude current item
      .map((id) => ({
        id,
        name: getRecord(id, workspaceId)?.name || "",
      }))
      .filter((item) => item.name)
      .reverse();
  }, [requestExecutionResult.recordId, workspaceId]);

  const depth = collectionPath.length;

  const handleRequestClick = (e: React.MouseEvent) => {
    if (clickable) {
      e.stopPropagation();
      openBufferedTab({
        preview: false,
        source: new RequestViewTabSource({
          id: requestExecutionResult.recordId,
          title: requestExecutionResult.recordName,
          context: {
            id: workspaceId,
          },
        }),
      });
    }
  };

  if (!workspaceId) return null;

  return (
    <Breadcrumb separator=">" className={className}>
      <Breadcrumb.Item>
        <span className="root-collection-name">{collectionPath[0]?.name}</span>
      </Breadcrumb.Item>
      {showFullPath && depth > 1 && (
        <Breadcrumb.Item
          menu={{
            items: collectionPath.slice(1).map((collection) => ({
              key: collection.id,
              label: collection.name,
            })),
          }}
        >
          ...
        </Breadcrumb.Item>
      )}
      <Breadcrumb.Item>
        <span
          className="request-name"
          title={requestExecutionResult.recordName}
          onClick={handleRequestClick}
          style={clickable ? { cursor: "pointer" } : undefined}
        >
          {requestExecutionResult.recordName}
        </span>
      </Breadcrumb.Item>
    </Breadcrumb>
  );
};

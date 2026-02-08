import React, { useMemo } from "react";
import { Breadcrumb } from "antd";
import { RequestExecutionResult } from "features/apiClient/slices/common/runResults/types";
import { getAncestorIds, getRecord } from "features/apiClient/slices/apiRecords/utils";
import { useTabActions } from "componentsV2/Tabs/slice";
import { RequestViewTabSource } from "../../../../../../RequestView/requestViewTabSource";

interface RequestBreadcrumbProps {
  requestExecutionResult: RequestExecutionResult;
  workspaceId: string | null;
  clickable?: boolean;
  showFullPath?: boolean;
  className?: string;
  breadCrumbSeperator: string;
}

export const RequestBreadcrumb: React.FC<RequestBreadcrumbProps> = ({
  requestExecutionResult,
  workspaceId = null,
  clickable = false,
  showFullPath = true,
  className = "request-name-details-breadcrumb",
  breadCrumbSeperator,
}) => {
  const { openBufferedTab } = useTabActions();

  const collectionPath = useMemo(() => {
    const ancestorIds = getAncestorIds(requestExecutionResult.recordId, workspaceId);
    return ancestorIds
      ?.slice(0, -1)
      ?.map((id) => ({
        id,
        name: getRecord(id, workspaceId)?.name || "",
      }))
      ?.filter((item) => item?.name)
      ?.reverse();
  }, [requestExecutionResult.recordId, workspaceId]);

  const depth = collectionPath?.length;

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

  return (
    <Breadcrumb separator={breadCrumbSeperator} className={className}>
      <Breadcrumb.Item>
        <span className="root-collection-name" title={collectionPath[0]?.name}>
          {collectionPath[0]?.name}
        </span>
      </Breadcrumb.Item>
      {showFullPath && depth > 1 && (
        <Breadcrumb.Item
          menu={{
            items: collectionPath.slice(1).map((collection) => ({
              key: collection.id,
              label: (
                <span className="breadcrumb-dropdown-item" title={collection.name}>
                  {collection.name}
                </span>
              ),
            })),
          }}
          className="breadcrumb-ellipsis"
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

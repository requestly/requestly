import React, { useMemo } from "react";
import { RequestExecutionResult } from "features/apiClient/slices/common/runResults/types";
import { RQAPI } from "features/apiClient/types";
import {
  GraphQlIcon,
  HttpMethodIcon,
} from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import NetworkStatusField from "components/misc/NetworkStatusField";
import { RequestBreadcrumb } from "./RequestBreadcrumb";

interface RequestDetailsHeaderProps {
  requestExecutionResult: RequestExecutionResult;
  workspaceId: string | null;
  clickable?: boolean;
  showFullPath?: boolean;
  showNetworkDetails?: boolean;
}

export const RequestDetailsHeader: React.FC<RequestDetailsHeaderProps> = ({
  requestExecutionResult,
  workspaceId = null,
  clickable = false,
  showFullPath = true,
  showNetworkDetails = true,
}) => {
  const responseDetails = useMemo(() => {
    return (
      <div className="response-details">
        <span className="response-time">
          {requestExecutionResult.entry.responseTime != null
            ? Math.round(requestExecutionResult.entry.responseTime)
            : 0}
          ms
        </span>
        {requestExecutionResult.entry.statusCode ? (
          <NetworkStatusField
            status={requestExecutionResult.entry.statusCode}
            statusText={requestExecutionResult.entry.statusText ?? undefined}
          />
        ) : null}
      </div>
    );
  }, [
    requestExecutionResult.entry.responseTime,
    requestExecutionResult.entry.statusCode,
    requestExecutionResult.entry.statusText,
  ]);

  return (
    <div className="request-details">
      <div className="request-method-breadcrumb-section">
        <span className="icon">
          {requestExecutionResult.entry.type === RQAPI.ApiEntryType.GRAPHQL ? (
            <GraphQlIcon />
          ) : (
            <HttpMethodIcon method={requestExecutionResult.entry.method} />
          )}
        </span>
        <RequestBreadcrumb
          requestExecutionResult={requestExecutionResult}
          workspaceId={workspaceId}
          clickable={clickable}
          showFullPath={showFullPath}
        />
      </div>
      {showNetworkDetails && responseDetails}
    </div>
  );
};

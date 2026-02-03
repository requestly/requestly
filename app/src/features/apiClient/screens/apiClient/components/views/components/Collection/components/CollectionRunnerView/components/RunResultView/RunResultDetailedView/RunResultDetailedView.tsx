import React, { useMemo } from "react";
import { Tabs, Typography } from "antd";
import { RequestExecutionResult } from "features/apiClient/slices/common/runResults/types";
import { RQAPI } from "features/apiClient/types";
import { DataTab } from "./DataTab";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./runResultDetailedView.scss";
import { getStatusColor } from "../utils";

interface Props {
  onClose: () => void;
  requestExecutionResult: RequestExecutionResult | null;
  headerBreadcrumb: React.ReactNode;
}

export const RunResultDetailedView: React.FC<Props> = ({ onClose, requestExecutionResult, headerBreadcrumb }) => {
  const method = useMemo(() => {
    const request = requestExecutionResult?.request;
    if (request && "method" in request) {
      return (request as RQAPI.HttpRequest).method;
    }
    return undefined;
  }, [requestExecutionResult]);

  const statusCode = useMemo(() => {
    return requestExecutionResult?.response?.status;
  }, [requestExecutionResult]);

  const tabItems = useMemo(() => {
    return [
      {
        key: "response",
        label: "Response",
        children: (
          <DataTab
            type="response"
            response={requestExecutionResult?.response}
            method={method}
            statusCode={statusCode}
          />
        ),
      },
      {
        key: "request",
        label: "Request",
        children: <DataTab type="request" request={requestExecutionResult?.request} method={method} />,
      },
    ];
  }, [requestExecutionResult, method, statusCode]);

  if (!requestExecutionResult) {
    return null;
  }

  const StatusCodeIcon = ({ statusCode }: { statusCode: number | undefined }) => {
    const { color, backgroundColor } = getStatusColor(statusCode);
    return (
      <Typography.Text
        strong
        className="status-code"
        style={{
          color,
          backgroundColor,
        }}
      >
        {statusCode || "ERR"}
      </Typography.Text>
    );
  };

  const tabBarExtraContent = (
    <div className="tab-extra-content-details">
      <StatusCodeIcon statusCode={requestExecutionResult?.entry?.statusCode || 0} />
      <span className="response-time">
        {requestExecutionResult.entry.responseTime != null ? Math.round(requestExecutionResult.entry.responseTime) : 0}{" "}
        ms
      </span>
    </div>
  );
  return (
    <div className="request-details-content">
      <div className="request-details-header">
        {headerBreadcrumb}
        <RQButton size="small" type="transparent" icon={<MdClose />} onClick={onClose} className="close-button" />
      </div>
      <Tabs items={tabItems} defaultActiveKey="response" tabBarExtraContent={tabBarExtraContent} />
    </div>
  );
};

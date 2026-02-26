import React, { useMemo } from "react";
import { Tabs, Typography } from "antd";
import { ExecutionId, RQAPI } from "features/apiClient/types";
import { DataTab } from "./DataTab";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useSelector } from "react-redux";
import { getEventByExecutionId } from "store/slices/eventsStream/selectors";
import "./runResultDetailedView.scss";
import { getStatusColor } from "../utils";

interface Props {
  onClose: () => void;
  executionId: ExecutionId | null;
  headerBreadcrumb: React.ReactNode;
}

export const RunResultDetailedView: React.FC<Props> = ({ onClose, executionId, headerBreadcrumb }) => {
  const events = useSelector((state) => (executionId ? getEventByExecutionId(executionId)(state as any) : []));

  const requestEvent = useMemo(() => events.find((e) => e.data.type === "REQUEST"), [events]);

  const responseEvent = useMemo(() => events.find((e) => e.data.type === "RESPONSE"), [events]);

  const eventRequest = requestEvent?.data.payload as RQAPI.Request | undefined;
  const eventResponse = responseEvent?.data.payload as RQAPI.Response | undefined;

  const method = useMemo(() => {
    const request = eventRequest;
    if (request && "method" in request) {
      return request.method;
    }
    return undefined;
  }, [eventRequest]);

  const statusCode = useMemo(() => {
    if (eventResponse && "status" in eventResponse) {
      return eventResponse.status;
    }
    return undefined;
  }, [eventResponse]);

  const responseTime = useMemo(() => {
    if (eventResponse && "time" in eventResponse) {
      return eventResponse.time;
    }
    return undefined;
  }, [eventResponse]);

  const tabItems = useMemo(() => {
    return [
      {
        key: "response",
        label: "Response",
        children: <DataTab type="response" response={eventResponse} method={method} statusCode={statusCode} />,
      },
      {
        key: "request",
        label: "Request",
        children: <DataTab type="request" request={eventRequest} method={method} />,
      },
    ];
  }, [method, statusCode, eventRequest, eventResponse]);

  if (!executionId) {
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
      <StatusCodeIcon statusCode={statusCode} />
      <span className="response-time">
        {responseTime != null ? Math.round(responseTime) : 0}
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

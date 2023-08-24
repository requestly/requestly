import { Collapse } from "antd";
import { DetailsTab } from "@requestly-ui/resource-table";
import { RQNetworkEventErrorCodes } from "@requestly/web-sdk";
import NetworkStatusField from "components/misc/NetworkStatusField";
import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import NetworkLogProperty from "views/features/sessions/SessionViewer/NetworkLogs/NetworkLogProperty";
import NetworkPayload from "views/features/sessions/SessionViewer/NetworkLogs/NetworkPayload";

const { Panel } = Collapse;

export const detailsTabs: DetailsTab<RQNetworkLog>[] = [
  {
    key: "headers",
    label: "Headers",
    render: (log: RQNetworkLog) => {
      return (
        <div>
          <Collapse defaultActiveKey={[0, 1, 2]}>
            <Panel header="General" key={0}>
              <div className="network-log-details-tab-content">
                <NetworkLogProperty label="Request URL">{log.url}</NetworkLogProperty>

                {!!log.response.url && log.response.url !== log.url ? (
                  <NetworkLogProperty label="Redirected URL">{log.response.url as string}</NetworkLogProperty>
                ) : null}

                <NetworkLogProperty label="Request Method">
                  {log.request.method?.toUpperCase() ?? "GET"}
                </NetworkLogProperty>

                <NetworkLogProperty label="Status Code">
                  <NetworkStatusField
                    status={log.response.statusCode}
                    statusText={(log.response?.statusText as string) ?? ""}
                  />
                </NetworkLogProperty>
              </div>
            </Panel>
            <Panel header="Response Headers" key={1}>
              {Object.entries(log.response.headers).map(([header, value]) => (
                <NetworkLogProperty key={header} label={header}>
                  {value}
                </NetworkLogProperty>
              ))}
            </Panel>
            <Panel header="Request Headers" key={2}>
              {Object.entries(log.request.headers).map(([header, value]) => (
                <NetworkLogProperty key={header} label={header}>
                  {value}
                </NetworkLogProperty>
              ))}
            </Panel>
          </Collapse>
        </div>
      );
    },
  },
  {
    key: "payload",
    label: "Payload",
    render: (log: RQNetworkLog) => (
      <Collapse defaultActiveKey={[0, 1]} ghost>
        <Panel header="Query String Parameters" key={0}>
          <div>
            {log.request.queryParams?.length > 0 &&
              log.request.queryParams.map(({ name, value }) => (
                <NetworkLogProperty key={value} label={name}>
                  {value}
                </NetworkLogProperty>
              ))}
          </div>
        </Panel>
        {log.request.body && (
          <Panel header="Request Payload" key={1}>
            <NetworkPayload
              payload={log.request.body}
              isPayloadTooLarge={((log.response?.errors as any) ?? [])?.includes(
                RQNetworkEventErrorCodes.REQUEST_TOO_LARGE
              )}
            />
          </Panel>
        )}
      </Collapse>
    ),
  },
  {
    key: "preview",
    label: "Preview",
    render: (log: RQNetworkLog) => <></>,
  },
  {
    key: "response",
    label: "Response",
    render: (log: RQNetworkLog) => {
      const responseTimeInSeconds = log.response?.responseTime
        ? (((log.response?.responseTime as number) ?? 0) / 1000).toFixed(3)
        : null;

      return (
        <div className="network-log-details-tab-content">
          {!!responseTimeInSeconds && (
            <NetworkLogProperty label="Response Time">{responseTimeInSeconds} sec</NetworkLogProperty>
          )}

          <NetworkPayload
            label="Body"
            payload={log.response.body}
            isPayloadTooLarge={(log.response?.errors as any)?.includes(RQNetworkEventErrorCodes.RESPONSE_TOO_LARGE)}
          />
        </div>
      );
    },
  },
];

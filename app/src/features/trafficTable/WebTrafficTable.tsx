import React, { useEffect, useMemo, useState } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { startInterception, stopInterception } from "actions/ExtensionActions";
import { RQNetworkTable } from "lib/design-system/components";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import "./webNetworkTable.scss";
import { Button } from "antd";
import {
  GenericNetworkTable,
  GenericNetworkTableProps,
} from "lib/design-system/components/RQNetworkTable/GenericNetworkTable";

const WebTrafficTable: React.FC = () => {
  const [logs, setLogs] = useState<RQNetworkLog[]>([]);

  const extraColumns: GenericNetworkTableProps<RQNetworkLog>["extraColumns"] = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
        width: 6,
        priority: 3,
        render: (log) => {
          return <span>{log.entry.response.content.mimeType}</span>;
        },
      },
    ],
    []
  );

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener("webRequestIntercepted", (message) => {
      console.log("!!!debug", "message in port webApp", message);
      const { requestDetails } = message;
      setLogs((prevLogs) => {
        return [
          ...prevLogs,
          {
            id: requestDetails.requestId,
            entry: {
              time: requestDetails.timeStamp,
              request: {
                url: requestDetails.url,
                method: requestDetails.method,
                headers: requestDetails.requestHeaders ?? [],
                queryString: [],
                postData: {
                  text:
                    JSON.stringify(requestDetails.requestBody?.formData ?? {}) || requestDetails.requestBody?.raw || "",
                },
              },
              response: {
                headers: requestDetails.responseHeaders ?? [],
                status: requestDetails.statusCode,
                content: {
                  text: requestDetails.responseBody || "",
                  mimeType: requestDetails.type,
                },
              },
            },
          },
        ];
      });
    });
  }, []);

  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <Button onClick={startInterception}>Start Interception</Button>
      <Button onClick={stopInterception}>Stop Interception</Button>
      {/* <RQNetworkTable logs={logs} /> */}
      <GenericNetworkTable
        logs={logs}
        extraColumns={extraColumns}
        excludeColumns={["startedDateTime", "contentType", "time"]}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        // contextMenuOptions={contextMenuOptions}
        // onContextMenuOpenChange={onContextMenuOpenChange}
        // emptyView={emptyView}
        // rowStyle={(log: RQNetworkLog) => (isLogPending(log) ? { opacity: 0.45 } : {})}
        // autoScroll={autoScroll}
        // tableRef={containerRef}
        // onTableScroll={onScroll}
        // disableFilters={disableFilters}
      />
    </div>
  );
};

export default WebTrafficTable;

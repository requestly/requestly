import React, { useEffect, useState } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { startInterception, stopInterception } from "actions/ExtensionActions";
import { RQNetworkTable } from "lib/design-system/components";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import "./webNetworkTable.scss";
import { Button } from "antd";

const WebTrafficTable: React.FC = () => {
  const [logs, setLogs] = useState<RQNetworkLog[]>([]);

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
                headers: requestDetails.requestHeaders,
                postData: {
                  text:
                    JSON.stringify(requestDetails.requestBody?.formData ?? {}) || requestDetails.requestBody?.raw || "",
                },
              },
              response: {
                headers: requestDetails.responseHeaders,
                status: requestDetails.statusCode,
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
      <RQNetworkTable logs={logs} />
    </div>
  );
};

export default WebTrafficTable;

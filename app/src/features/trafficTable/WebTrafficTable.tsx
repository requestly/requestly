import React, { useEffect, useState } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { startInterception } from "actions/ExtensionActions";
import { RQNetworkTable } from "lib/design-system/components";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";

const WebTrafficTable: React.FC = () => {
  const [logs, setLogs] = useState<RQNetworkLog[]>([]);

  useEffect(() => {
    startInterception();

    PageScriptMessageHandler.addMessageListener("rq-web-request", (message) => {
      if (message.action === "rq-web-request") {
        console.log("!!!debug", "message in port webApp", message);
        setLogs((prevLogs) => {
          return [
            ...prevLogs,
            {
              id: message.details.requestId,
              entry: {
                time: message.details.timestamp,
                startedDateTime: String(message.details.timestamp),
                request: {
                  url: message.details.url,
                  method: message.details.method,
                },
                response: {
                  status: message.details.statusCode,
                },
              },
            },
          ];
        });
      }
    });
  }, []);

  return <RQNetworkTable logs={logs} />;
};

export default WebTrafficTable;

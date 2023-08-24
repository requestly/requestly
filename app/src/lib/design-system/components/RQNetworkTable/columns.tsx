import { Column } from "@requestly-ui/resource-table";
import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export const rqNetworkLogColumns: Column<RQNetworkLog>[] = [
  {
    key: "time",
    header: "Time",
    width: 6,
    render: (log: RQNetworkLog) => log.timestamp,
  },
  {
    key: "url",
    header: "URL",
    width: 50,
    render: (log: RQNetworkLog) => log.url,
  },
  {
    key: "method",
    header: "Method",
    width: 8,
    render: (log: RQNetworkLog) => log.request.method,
  },
  {
    key: "contentType",
    header: "Content-Type",
    width: 15,
    render: (log: RQNetworkLog) => log.response.contentType,
  },
  {
    key: "rulesApplied",
    header: "Rules applied",
    width: 6,
    render: (log: RQNetworkLog) => log.actions,
  },
  {
    key: "status",
    header: "Status",
    width: 6,
    render: (log: RQNetworkLog) => log.response.statusCode,
  },
];

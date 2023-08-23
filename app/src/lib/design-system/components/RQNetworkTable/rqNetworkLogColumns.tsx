/**
 *
 * 1. timestamp
 * 2. URL
 * 3. Method
 * 4. Content-Type
 * 5. Actions (optional)
 * 6. Status
 *
 * for each column know how to render data in each cell
 * now we may not have all the column data so filter those parts and then render
 */

import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

export const rqNetworkLogColumns = [
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

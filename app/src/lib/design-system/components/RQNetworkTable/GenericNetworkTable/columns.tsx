import { REQUEST_METHOD_COLORS, RequestMethod } from "../../../../../constants/requestMethodColors";
import { Column, NetworkEntry } from "./types";

export const getDefaultColumns = <NetworkLog,>(networkEntrySelector: (log: NetworkLog) => NetworkEntry) => {
  const harColumns: Column<NetworkLog>[] = [
    {
      key: "startedDateTime",
      header: "Time",
      width: 5,
      priority: 0,
      render: (log) => networkEntrySelector(log).startedDateTime,
    },
    {
      key: "url",
      header: "URL",
      width: 50,
      priority: 1,
      render: (log) => networkEntrySelector(log).request.url,
    },
    {
      key: "method",
      header: "Method",
      width: 8,
      priority: 2,
      render: (log) => {
        const method = networkEntrySelector(log).request.method as RequestMethod;
        return <div style={{ color: REQUEST_METHOD_COLORS[method] }}>{method}</div>;
      },
    },
    {
      key: "contentType",
      header: "Content-Type",
      width: 15,
      priority: 3,
      render: (log) => networkEntrySelector(log).response.content.mimeType,
    },
    {
      key: "status",
      header: "Status",
      width: 6,
      priority: 4,
      render: (log) => networkEntrySelector(log).response.status,
    },
    {
      key: "time",
      header: "Time",
      width: 6,
      priority: 4,
      render: (log) => `${networkEntrySelector(log).time} ms`,
    },
  ];

  return harColumns;
};

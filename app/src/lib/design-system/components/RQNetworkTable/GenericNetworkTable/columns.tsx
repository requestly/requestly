import { Column } from "@requestly-ui/resource-table";
import { NetworkEntry } from "../types";

export const getDefaultColumns = <NetworkLog,>(networkEntrySelector: (log: NetworkLog) => NetworkEntry) => {
  const harColumns: Column<NetworkLog>[] = [
    {
      key: "time",
      header: "Start Time",
      width: 6,
      render: (log) => networkEntrySelector(log).startedDateTime,
    },
    {
      key: "url",
      header: "URL",
      width: 50,
      render: (log) => networkEntrySelector(log).request.url,
    },
    {
      key: "method",
      header: "Method",
      width: 8,
      render: (log) => networkEntrySelector(log).request.method,
    },
    {
      key: "contentType",
      header: "Content-Type",
      width: 15,
      render: (log) => networkEntrySelector(log).response.content.mimeType,
    },
    {
      key: "status",
      header: "Status",
      width: 6,
      render: (log) => networkEntrySelector(log).response.status,
    },
  ];

  return harColumns;
};

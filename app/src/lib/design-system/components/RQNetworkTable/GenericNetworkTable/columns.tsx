import { Column, NetworkEntry } from "./types";

export const getDefaultColumns = <NetworkLog,>(networkEntrySelector: (log: NetworkLog) => NetworkEntry) => {
  const harColumns: Column<NetworkLog>[] = [
    {
      key: "time",
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
      render: (log) => networkEntrySelector(log).request.method,
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
  ];

  return harColumns;
};

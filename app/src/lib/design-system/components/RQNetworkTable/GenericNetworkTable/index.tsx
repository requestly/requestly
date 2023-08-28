import { ReactElement, useState } from "react";
import { ColorScheme, ResourceTable, Column, DetailsTab } from "@requestly-ui/resource-table";
import { NetworkEntry } from "./types";
import { getDefaultColumns } from "./columns";
import { getDefaultDetailsTabs } from "./detailsTabs";
import "./RQNetworkTable.css";

interface NetworkTableProps<NetworkLog> {
  logs: NetworkLog[];
  networkEntrySelector: (log: NetworkLog) => NetworkEntry;
  extraColumns: Column<NetworkLog>[];
  extraDetailsTabs: DetailsTab<NetworkLog>[];
}

export const GenericNetworkTable = <NetworkLog,>({
  logs,
  networkEntrySelector = (log: NetworkLog) => log as NetworkEntry,
  extraColumns,
  extraDetailsTabs,
}: NetworkTableProps<NetworkLog>): ReactElement => {
  const [, setSelectedLog] = useState<NetworkLog | null>(null);

  const finalColumns = [...getDefaultColumns(networkEntrySelector), ...extraColumns];
  const finalDetailsTabs = [...getDefaultDetailsTabs(networkEntrySelector), ...extraDetailsTabs];

  return (
    <ResourceTable
      resources={logs}
      columns={finalColumns}
      detailsTabs={finalDetailsTabs}
      primaryColumnKeys={["url"]}
      colorScheme={ColorScheme.DARK}
      onRowSelection={setSelectedLog}
    />
  );
};

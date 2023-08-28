import { ReactElement, useMemo, useState } from "react";
import { ColorScheme, ResourceTable, Column, DetailsTab } from "@requestly-ui/resource-table";
import { NetworkEntry } from "./types";
import { getDefaultColumns } from "./columns";
import { getDefaultDetailsTabs } from "./detailsTabs";

interface NetworkTableProps<NetworkLog> {
  logs: NetworkLog[];
  extraColumns?: Column<NetworkLog>[];
  extraDetailsTabs?: DetailsTab<NetworkLog>[];

  /**
   * @returns HAR entry from the given log.
   */
  networkEntrySelector: (log: NetworkLog) => NetworkEntry;
}

/**
 * GenericNetworkTable only renders the har logs.
 */
export const GenericNetworkTable = <NetworkLog,>({
  logs,
  extraColumns = [],
  extraDetailsTabs = [],
  networkEntrySelector = (log: NetworkLog) => log as NetworkEntry,
}: NetworkTableProps<NetworkLog>): ReactElement => {
  const [, setSelectedLog] = useState<NetworkLog | null>(null);

  const finalColumns = useMemo(() => [...getDefaultColumns(networkEntrySelector), ...extraColumns], [
    networkEntrySelector,
    extraColumns,
  ]);

  const finalDetailsTabs = useMemo(() => [...getDefaultDetailsTabs(networkEntrySelector), ...extraDetailsTabs], [
    networkEntrySelector,
    extraDetailsTabs,
  ]);

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

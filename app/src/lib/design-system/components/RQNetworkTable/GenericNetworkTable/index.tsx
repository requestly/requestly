import { ReactElement, useCallback, useMemo, useState } from "react";
import {
  ColorScheme,
  ContextMenuOption,
  DetailsTab,
  ResourceTable,
  ResourceTableProps,
} from "@requestly-ui/resource-table";
import { Column, NetworkEntry } from "./types";
import { getDefaultColumns } from "./columns";
import { getDefaultDetailsTabs } from "./detailsTabs";
import FiltersToolbar, { Filters } from "./components/FiltersToolbar/FiltersToolbar";

export interface GenericNetworkTableProps<NetworkLog> {
  logs: NetworkLog[];
  extraColumns?: Column<NetworkLog>[];
  extraDetailsTabs?: DetailsTab<NetworkLog>[];

  /**
   * If true then highlights the row with red color.
   */
  isFailed?: (log: NetworkLog) => boolean;

  /**
   * List of colunm keys to be excluded or hide from the table.
   */
  excludeColumns?: string[];

  /**
   * @returns HAR entry from the given log.
   */
  networkEntrySelector: (log: NetworkLog) => NetworkEntry;

  onContextMenuOpenChange?: ResourceTableProps<NetworkLog>["onContextMenuOpenChange"];

  contextMenuOptions?: ContextMenuOption<NetworkLog>[];
}

/**
 * GenericNetworkTable only renders the har logs.
 */
export const GenericNetworkTable = <NetworkLog,>({
  logs,
  extraColumns = [],
  extraDetailsTabs = [],
  excludeColumns = [],
  contextMenuOptions = [],
  networkEntrySelector = (log) => log as NetworkEntry,
  onContextMenuOpenChange = (isOpen) => {},
}: GenericNetworkTableProps<NetworkLog>): ReactElement => {
  const [, setSelectedLog] = useState<NetworkLog | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  const finalColumns = useMemo(
    () =>
      [...getDefaultColumns(networkEntrySelector), ...extraColumns]
        .filter((column) => !excludeColumns.includes(column.key))
        .sort((a, b) => a.priority - b.priority),
    [networkEntrySelector, excludeColumns, extraColumns]
  );

  const finalDetailsTabs = useMemo(() => [...getDefaultDetailsTabs(networkEntrySelector), ...extraDetailsTabs], [
    networkEntrySelector,
    extraDetailsTabs,
  ]);

  const isFailed = useCallback(
    (log: NetworkLog) => {
      const harEntry = networkEntrySelector(log);
      const { status } = harEntry.response;
      return !status || status >= 400;
    },
    [networkEntrySelector]
  );

  const filterLog = (networkLog: NetworkLog) => {
    const entry = networkEntrySelector(networkLog);

    if (filters.search) {
      if (!entry?.request?.url?.includes(filters.search)) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="network-container">
      <FiltersToolbar filters={filters} setFilters={setFilters} />
      <div className="rq-resource-table-wrapper">
        <ResourceTable
          resources={logs}
          isFailed={isFailed}
          columns={finalColumns}
          detailsTabs={finalDetailsTabs}
          primaryColumnKeys={["timeOffset", "url"]}
          colorScheme={ColorScheme.DARK}
          onRowSelection={setSelectedLog}
          contextMenuOptions={contextMenuOptions}
          filter={filterLog}
        />
      </div>
    </div>
  );
};

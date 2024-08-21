import { CSSProperties, ReactElement, RefObject, UIEventHandler, useCallback, useMemo, useState } from "react";
import {
  ColorScheme,
  ContextMenuOption,
  DetailsTab,
  ResourceTableProps,
  ResourceTable,
} from "@requestly-ui/resource-table";
import { Column, NetworkEntry } from "./types";
import { getDefaultColumns } from "./columns";
import { getDefaultDetailsTabs } from "./detailsTabs";
import FiltersToolbar from "./components/FiltersToolbar/FiltersToolbar";
import { NetworkFilters } from "./components/FiltersToolbar/types";

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

  emptyView?: ResourceTableProps<NetworkLog>["emptyView"];

  isRowPending?: (log: NetworkLog) => boolean;

  rowStyle?: (log: NetworkLog) => CSSProperties | CSSProperties;

  autoScroll?: boolean;

  tableRef?: RefObject<HTMLDivElement>;

  onTableScroll?: UIEventHandler<HTMLElement>;

  disableFilters?: boolean;

  onRowClick?: (log: NetworkLog) => void;
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
  emptyView,
  rowStyle,
  autoScroll = false,
  tableRef,
  onTableScroll,
  disableFilters = false,
  onRowClick,
}: GenericNetworkTableProps<NetworkLog>): ReactElement => {
  const [, setSelectedLog] = useState<NetworkLog | null>(null);
  const [filters, setFilters] = useState<NetworkFilters>({ search: "", method: [], statusCode: [] });

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

  const statusCodeFilter = useCallback(
    (logEntry: NetworkEntry) => {
      if (!filters.statusCode.length) return true;
      return filters.statusCode.some((code) => code[0] === logEntry?.response?.status.toString()[0]);
    },
    [filters.statusCode]
  );

  const methodsFilter = useCallback(
    (logEntry: NetworkEntry) => {
      if (!filters.method.length) return true;
      return filters.method.some((method) => method === logEntry?.request.method);
    },
    [filters.method]
  );

  const filterLog = useCallback(
    (networkLog: NetworkLog) => {
      let includeLog = false;
      const entry = networkEntrySelector(networkLog);
      includeLog =
        !!entry?.request?.url?.toLowerCase()?.includes(filters.search.toLowerCase()) &&
        statusCodeFilter(entry) &&
        methodsFilter(entry); // TODO: add checks for other filters here
      return includeLog;
    },
    [networkEntrySelector, filters.search, statusCodeFilter, methodsFilter]
  );

  const handleRowClick = useCallback(
    (log: NetworkLog) => {
      setSelectedLog(log);
      onRowClick?.(log);
    },
    [onRowClick, setSelectedLog]
  );

  return (
    <div className="network-container">
      <FiltersToolbar filters={filters} setFilters={setFilters} disabled={disableFilters} />
      <div className="rq-resource-table-wrapper">
        <ResourceTable
          resources={logs}
          isFailed={isFailed}
          columns={finalColumns}
          detailsTabs={finalDetailsTabs}
          primaryColumnKeys={["timeOffset", "url"]}
          colorScheme={ColorScheme.DARK}
          onRowSelection={handleRowClick}
          contextMenuOptions={contextMenuOptions}
          filter={filterLog}
          emptyView={emptyView}
          rowStyle={rowStyle}
          autoScroll={autoScroll}
          tableRef={tableRef}
          onTableScroll={onTableScroll}
        />
      </div>
    </div>
  );
};

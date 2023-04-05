import React, { useCallback, useMemo, useState } from "react";
import { Table } from "@devtools-ds/table";
import {
  NetworkEvent,
  NetworkFilters,
  ResourceTypeFilter,
} from "../../../types";
import NetworkTableRow from "./NetworkTableRow";
import useAutoScrollableContainer from "../../../hooks/useAutoScrollableContainer";
import "./networkTable.scss";
import NetworkEventDetails from "../NetworkEventDetails/NetworkEventDetails";
import EmptyTablePlaceholder from "../../../components/EmptyPanelPlaceholder/EmptyPanelPlaceholder";
import SplitPane from "../../../components/SplitPane/SplitPane";

const getRowId = (index: number) => (index >= 0 ? `request-${index}` : "");
const getRowIndex = (id: string) =>
  id ? parseInt(id.substring("request-".length)) : undefined;

const NetworkTable: React.FC<{
  networkEvents: NetworkEvent[];
  filters: NetworkFilters;
}> = ({ networkEvents, filters }) => {
  const [selectedRowId, setSelectedRowId] = useState("");
  const [
    scrollableContainerRef,
    onScroll,
  ] = useAutoScrollableContainer<HTMLDivElement>(networkEvents);

  const selectedNetworkEvent = useMemo<NetworkEvent>(() => {
    if (!selectedRowId) {
      return null;
    }

    const selectedRowIndex = getRowIndex(selectedRowId);
    return networkEvents[selectedRowIndex];
  }, [selectedRowId]);

  const satisfiesFilters = useCallback(
    (networkEvent: NetworkEvent): boolean => {
      if (
        filters.url &&
        !networkEvent.request.url
          .toLowerCase()
          .includes(filters.url.toLowerCase())
      ) {
        return false;
      }

      if (
        !filters.resourceType ||
        filters.resourceType === ResourceTypeFilter.ALL
      ) {
        return true;
      }

      switch (filters.resourceType) {
        case ResourceTypeFilter.AJAX:
          return ["fetch", "xhr"].includes(networkEvent._resourceType);
        case ResourceTypeFilter.JS:
          return networkEvent._resourceType === "script";
        case ResourceTypeFilter.CSS:
          return networkEvent._resourceType === "stylesheet";
        case ResourceTypeFilter.IMG:
          return networkEvent._resourceType === "image";
        case ResourceTypeFilter.MEDIA:
          return networkEvent._resourceType === "media";
        case ResourceTypeFilter.FONT:
          return networkEvent._resourceType === "font";
        case ResourceTypeFilter.DOC:
          return networkEvent._resourceType === "document";
        case ResourceTypeFilter.WS:
          return networkEvent._resourceType === "websocket";
        case ResourceTypeFilter.WASM:
          return networkEvent._resourceType === "wasm"; // TODO
        case ResourceTypeFilter.MANIFEST:
          return networkEvent._resourceType === "manifest"; // TODO
        case ResourceTypeFilter.OTHER:
          return true;
      }
    },
    [filters]
  );

  return networkEvents.length > 0 ? (
    <SplitPane className="network-table-container">
      <div>
        <Table
          className="network-table"
          // @ts-ignore
          ref={scrollableContainerRef}
          onScroll={onScroll}
          selected={selectedRowId}
          onSelected={(id) => {
            setSelectedRowId(id);
          }}
        >
          <Table.Head>
            {selectedRowId ? (
              <Table.Row>
                <Table.HeadCell>URL</Table.HeadCell>
              </Table.Row>
            ) : (
              <Table.Row>
                <Table.HeadCell>URL</Table.HeadCell>
                <Table.HeadCell style={{ width: "6%" }}>Method</Table.HeadCell>
                <Table.HeadCell style={{ width: "6%" }}>Status</Table.HeadCell>
                <Table.HeadCell style={{ width: "10%" }}>Type</Table.HeadCell>
                <Table.HeadCell style={{ width: "8%" }}>Size</Table.HeadCell>
                <Table.HeadCell style={{ width: "8%" }}>Time</Table.HeadCell>
              </Table.Row>
            )}
          </Table.Head>
          <Table.Body>
            {networkEvents.map((networkEvent, index) =>
              satisfiesFilters(networkEvent) ? (
                <NetworkTableRow
                  key={index}
                  id={getRowId(index)}
                  networkEvent={networkEvent}
                  showOnlyURL={!!selectedRowId}
                />
              ) : null
            )}
          </Table.Body>
        </Table>
      </div>
      {selectedNetworkEvent && (
        <NetworkEventDetails
          networkEvent={selectedNetworkEvent}
          close={() => setSelectedRowId("")}
        />
      )}
    </SplitPane>
  ) : (
    <EmptyTablePlaceholder />
  );
};

export default NetworkTable;

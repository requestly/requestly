import React, { useCallback, useMemo, useState } from "react";
import { Table } from "@devtools-ds/table";
import { NetworkEvent, ResourceFilters } from "../../../types";
import NetworkTableRow from "./NetworkTableRow";
import useAutoScrollableContainer from "../../../hooks/useAutoScrollableContainer";
import NetworkEventDetails from "../NetworkEventDetails/NetworkEventDetails";
import SplitPane from "../../../components/SplitPane/SplitPane";
import { matchResourceTypeFilter } from "../../../utils";
import "./networkTable.scss";

const ROW_ID_PREFIX = "request-";
const getRowId = (index: number) =>
  index >= 0 ? `${ROW_ID_PREFIX}${index}` : "";
const getRowIndex = (id: string) =>
  id ? parseInt(id.substring(ROW_ID_PREFIX.length)) : undefined;

const NetworkTable: React.FC<{
  networkEvents: NetworkEvent[];
  filters: ResourceFilters;
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
        filters.resourceType &&
        !matchResourceTypeFilter(
          networkEvent._resourceType,
          filters.resourceType
        )
      ) {
        return false;
      }

      return true;
    },
    [filters]
  );

  return (
    <SplitPane className="network-table-container">
      <div>
        <Table
          className="network-table"
          // @ts-ignore
          ref={scrollableContainerRef}
          onScroll={onScroll}
          selected={selectedRowId}
          onSelected={setSelectedRowId}
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
  );
};

export default NetworkTable;

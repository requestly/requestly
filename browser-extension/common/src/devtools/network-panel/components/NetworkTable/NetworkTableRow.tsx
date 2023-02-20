import React, { memo, useMemo } from "react";
import { Table } from "@devtools-ds/table";
import { NetworkEvent } from "../../types";

interface Props {
  id: string;
  networkEvent: NetworkEvent;
  showOnlyURL?: boolean;
}

const NetworkTableRow: React.FC<Props> = ({
  id,
  networkEvent,
  showOnlyURL,
}) => {
  const isFailedRequest = useMemo<boolean>(() => {
    const status = networkEvent.response.status;
    return !status || (status >= 400 && status <= 599);
  }, [networkEvent.response.status]);

  const size = useMemo<string>(() => {
    const bytes = networkEvent.response.content.size;

    if (bytes < 1000) {
      return `${bytes} B`;
    }

    if (bytes < 1000000) {
      return `${Math.round(bytes / 1000)} Kb`;
    }

    return `${(bytes / 1000000).toFixed(1)} Mb`;
  }, [networkEvent.response.content.size]);

  const time = useMemo<string>(() => {
    const ms = Math.ceil(networkEvent.time);

    if (ms < 1000) {
      return `${ms} ms`;
    }

    return `${(ms / 1000).toFixed(3)} s`;
  }, [networkEvent.time]);

  return (
    <Table.Row
      id={id}
      className={`network-table-row ${isFailedRequest ? "failed" : ""}`}
    >
      <Table.Cell>{networkEvent.request.url}</Table.Cell>
      {showOnlyURL ? null : (
        <>
          <Table.Cell>{networkEvent.request.method}</Table.Cell>
          <Table.Cell>
            {networkEvent.response.status || "(canceled)"}
          </Table.Cell>
          <Table.Cell>{networkEvent._resourceType}</Table.Cell>
          <Table.Cell>{size}</Table.Cell>
          <Table.Cell>{time}</Table.Cell>
        </>
      )}
    </Table.Row>
  );
};

export default memo(NetworkTableRow);

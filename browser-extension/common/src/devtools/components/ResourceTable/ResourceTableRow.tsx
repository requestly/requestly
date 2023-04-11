import React, { ReactElement, memo } from "react";
import { Table } from "@devtools-ds/table";
import { Column } from "./types";

interface Props<ResourceType> {
  id: string;
  resource: ResourceType;
  columns: Column<ResourceType>[];
}

const ResourceTableRow = <ResourceType,>({
  id,
  resource,
  columns,
}: Props<ResourceType>): ReactElement => {
  return (
    <Table.Row id={id} className="rq-resource-table-row">
      {columns.map((column) => (
        <Table.Cell key={column.key}>{column.render(resource)}</Table.Cell>
      ))}
    </Table.Row>
  );
};

export default memo(ResourceTableRow);

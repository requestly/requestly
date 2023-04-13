import React, { ReactElement, useMemo, useState } from "react";
import SplitPane from "../SplitPane/SplitPane";
import { Table } from "@devtools-ds/table";
import useAutoScrollableContainer from "../../hooks/useAutoScrollableContainer";
import ResourceDetailsTabs from "./ResourceDetailsTabs/ResourceDetailsTabs";
import ResourceTableRow from "./ResourceTableRow";
import { Column, DetailsTab } from "./types";
import "./resourceTable.scss";

interface Props<ResourceType> {
  resources: ResourceType[];
  columns: Column<ResourceType>[];
  primaryColumnKeys?: string[]; // columns to show when details panel is opened
  detailsTabs?: DetailsTab<ResourceType>[]; // if multiple tabs to show in details panel for a resource
  filter?: (resource: ResourceType) => boolean;
  isFailed?: (resource: ResourceType) => boolean; // if returns true, the row will be marked failed
}

const ROW_ID_PREFIX = "resource-"; // TODO: move to local state
const getRowId = (index: number) => (index >= 0 ? `${ROW_ID_PREFIX}${index}` : "");
const getRowIndex = (id: string) => (id ? parseInt(id.substring(ROW_ID_PREFIX.length)) : undefined);

const ResourceTable = <ResourceType,>({
  columns,
  resources,
  primaryColumnKeys,
  detailsTabs,
  filter,
  isFailed,
}: Props<ResourceType>): ReactElement => {
  const [selectedRowId, setSelectedRowId] = useState("");
  const [scrollableContainerRef, onScroll] = useAutoScrollableContainer<HTMLDivElement>(resources);

  const selectedResource = useMemo<ResourceType>(() => {
    if (!selectedRowId) {
      return null;
    }

    const selectedRowIndex = getRowIndex(selectedRowId);
    return resources[selectedRowIndex];
  }, [selectedRowId]);

  const columnsToRender = useMemo<Column<ResourceType>[]>(() => {
    if (selectedResource && detailsTabs) {
      if (primaryColumnKeys) {
        return columns.filter((column) => primaryColumnKeys.includes(column.key));
      }
    }
    return columns;
  }, [selectedResource, detailsTabs, primaryColumnKeys]);

  return (
    <SplitPane className="rq-resource-table-container">
      <div>
        <Table
          className="rq-resource-table"
          // @ts-ignore
          ref={scrollableContainerRef}
          onScroll={onScroll}
          selected={selectedRowId}
          onSelected={setSelectedRowId}
        >
          <Table.Head>
            <Table.Row>
              {columnsToRender.map((column) => (
                <Table.HeadCell key={column.key} style={{ width: column.width ? `${column.width}%` : "auto" }}>
                  {column.header}
                </Table.HeadCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {resources.map((resource, index) =>
              filter(resource) ? (
                <ResourceTableRow
                  key={index}
                  id={getRowId(index)}
                  resource={resource}
                  columns={columnsToRender}
                  isFailed={isFailed}
                />
              ) : null
            )}
          </Table.Body>
        </Table>
      </div>
      {selectedResource && detailsTabs ? (
        <ResourceDetailsTabs resource={selectedResource} tabs={detailsTabs} close={() => setSelectedRowId("")} />
      ) : null}
    </SplitPane>
  );
};

export default ResourceTable;

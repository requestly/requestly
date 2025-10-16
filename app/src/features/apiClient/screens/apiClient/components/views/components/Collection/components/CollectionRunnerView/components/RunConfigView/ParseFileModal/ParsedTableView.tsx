import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import React from "react";
import "./ParsedTableView.scss";

//stubs
const dataSource = [
  {
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
];

const keys = Object.keys(dataSource[0]);
const columns = [
  {
    title: "Iteration",
    dataIndex: "iteration",
    key: "iteration",
  },
  ...keys.map((k) => ({
    title: k.charAt(0).toUpperCase() + k.slice(1),
    dataIndex: k,
    key: k,
  })),
];

const addIterationColumnToTable = (dataSource: any[]) => {
  return dataSource.map((row, index) => ({
    ...row,
    iteration: index + 1,
  }));
};

export const PreviewTableView: React.FC = () => {
  return (
    <ContentListTable
      id="parsed-file-preview-table"
      data={addIterationColumnToTable(dataSource)}
      columns={columns}
      className="parsed-values-table"
      locale={{ emptyText: `No entries found` }}
    />
  );
};

export default withContentListTableContext(PreviewTableView);

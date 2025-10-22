import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import React, { useRef } from "react";
import "./ParsedTableView.scss";
import { useVirtualizer } from "@tanstack/react-virtual";

//stubs - Generate 2000 entries
const generateDataSource = () => {
  const names = [
    "Mike",
    "John",
    "Sarah",
    "David",
    "Emma",
    "James",
    "Olivia",
    "William",
    "Sophia",
    "Liam",
    "Ava",
    "Noah",
    "Isabella",
    "Mason",
    "Mia",
    "Ethan",
    "Charlotte",
    "Lucas",
    "Amelia",
    "Benjamin",
  ];
  const addresses = [
    "10 Downing Street",
    "221B Baker Street",
    "42 Wallaby Way",
    "742 Evergreen Terrace",
    "1600 Pennsylvania Ave",
    "123 Main Street",
    "456 Oak Avenue",
    "789 Pine Road",
    "321 Elm Street",
    "654 Maple Drive",
    "987 Cedar Lane",
    "147 Birch Boulevard",
  ];
  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Design",
    "Operations",
    "Product",
    "Legal",
    "Support",
  ];
  const statuses = ["Active", "Inactive"];

  const data = [];
  for (let i = 1; i <= 500; i++) {
    data.push({
      name: names[i % names.length],
      age: 25 + (i % 20),
      address: addresses[i % addresses.length],
      testing: `test${i}`,
      email: `user${i}@example.com`,
      status: statuses[i % statuses.length],
      department: departments[i % departments.length],
      salary: 55000 + (i % 50) * 1000,
      phone: `+1-555-${String(i).padStart(4, "0")}`,
    });
  }
  return data;
};

const dataSource = generateDataSource();

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

//logic to create iteration column in table

const addIterationColumnToTable = (dataSource: any[]) => {
  return dataSource.map((row, index) => ({
    ...row,
    iteration: index + 1,
  }));
};

export const PreviewTableView: React.FC = () => {
  const parentRef = useRef(null);

  const data = addIterationColumnToTable(dataSource);
  const limitedData = data.length > 1000 ? data.slice(0, 1000) : data;

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => data.length,
    overscan: 5,
  });

  //x -> direction should be scrolling till the last columm
  return (
    <div ref={parentRef} className="parsed-table-view-container">
      <ContentListTable
        id="parsed-file-preview-table"
        data={limitedData}
        columns={columns}
        className="parsed-values-table"
        locale={{ emptyText: `No entries found` }}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default withContentListTableContext(PreviewTableView);

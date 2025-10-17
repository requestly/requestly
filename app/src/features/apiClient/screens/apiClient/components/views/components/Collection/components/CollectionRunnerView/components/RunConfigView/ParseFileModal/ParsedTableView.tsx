import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import React, { useRef } from "react";
import "./ParsedTableView.scss";
import { useVirtualizer } from "@tanstack/react-virtual";

//stubs
// const dataSource = [
//   {
//     name: "Mike",
//     age: 32,
//     address: "10 Downing Street",
//     testing: "test1",
//     email: "mike@example.com",
//     status: "Active",
//     department: "Engineering",
//     salary: 75000,
//     phone: "+1-555-0101",
//   },
//   {
//     name: "John",
//     age: 42,
//     address: "10 Downing Street",
//     testing: "test2",
//     email: "john@example.com",
//     status: "Active",
//     department: "Marketing",
//     salary: 68000,
//     phone: "+1-555-0102",
//   },
//   {
//     name: "Mike",
//     age: 32,
//     address: "10 Downing Street",
//     testing: "test3",
//     email: "mike@example.com",
//     status: "Active",
//     department: "Engineering",
//     salary: 75000,
//     phone: "+1-555-0101",
//   },
//   {
//     name: "John",
//     age: 42,
//     address: "10 Downing Street",
//     testing: "test4",
//     email: "john@example.com",
//     status: "Inactive",
//     department: "Marketing",
//     salary: 68000,
//     phone: "+1-555-0102",
//   },
//   {
//     name: "Mike",
//     age: 32,
//     address: "10 Downing Street",
//     testing: "test5",
//     email: "mike@example.com",
//     status: "Active",
//     department: "Engineering",
//     salary: 75000,
//     phone: "+1-555-0101",
//   },
//   {
//     name: "John",
//     age: 42,
//     address: "10 Downing Street",
//     testing: "test6",
//     email: "john@example.com",
//     status: "Active",
//     department: "Marketing",
//     salary: 68000,
//     phone: "+1-555-0102",
//   },
//   {
//     name: "Sarah",
//     age: 28,
//     address: "221B Baker Street",
//     testing: "test7",
//     email: "sarah@example.com",
//     status: "Active",
//     department: "Sales",
//     salary: 62000,
//     phone: "+1-555-0103",
//   },
//   {
//     name: "David",
//     age: 35,
//     address: "42 Wallaby Way",
//     testing: "test8",
//     email: "david@example.com",
//     status: "Active",
//     department: "HR",
//     salary: 58000,
//     phone: "+1-555-0104",
//   },
//   {
//     name: "Emma",
//     age: 29,
//     address: "742 Evergreen Terrace",
//     testing: "test9",
//     email: "emma@example.com",
//     status: "Active",
//     department: "Engineering",
//     salary: 82000,
//     phone: "+1-555-0105",
//   },
//   {
//     name: "James",
//     age: 45,
//     address: "1600 Pennsylvania Ave",
//     testing: "test10",
//     email: "james@example.com",
//     status: "Inactive",
//     department: "Finance",
//     salary: 95000,
//     phone: "+1-555-0106",
//   },
//   {
//     name: "Olivia",
//     age: 31,
//     address: "123 Main Street",
//     testing: "test11",
//     email: "olivia@example.com",
//     status: "Active",
//     department: "Design",
//     salary: 71000,
//     phone: "+1-555-0107",
//   },
//   {
//     name: "William",
//     age: 38,
//     address: "456 Oak Avenue",
//     testing: "test12",
//     email: "william@example.com",
//     status: "Active",
//     department: "Operations",
//     salary: 66000,
//     phone: "+1-555-0108",
//   },
//   {
//     name: "Sophia",
//     age: 26,
//     address: "789 Pine Road",
//     testing: "test13",
//     email: "sophia@example.com",
//     status: "Active",
//     department: "Marketing",
//     salary: 59000,
//     phone: "+1-555-0109",
//   },
//   {
//     name: "Liam",
//     age: 33,
//     address: "321 Elm Street",
//     testing: "test14",
//     email: "liam@example.com",
//     status: "Active",
//     department: "Engineering",
//     salary: 79000,
//     phone: "+1-555-0110",
//   },
//   {
//     name: "Ava",
//     age: 27,
//     address: "654 Maple Drive",
//     testing: "test15",
//     email: "ava@example.com",
//     status: "Inactive",
//     department: "Sales",
//     salary: 64000,
//     phone: "+1-555-0111",
//   },
//   {
//     name: "Noah",
//     age: 40,
//     address: "987 Cedar Lane",
//     testing: "test16",
//     email: "noah@example.com",
//     status: "Active",
//     department: "Product",
//     salary: 88000,
//     phone: "+1-555-0112",
//   },
//   {
//     name: "Isabella",
//     age: 30,
//     address: "147 Birch Boulevard",
//     testing: "test17",
//     email: "isabella@example.com",
//     status: "Active",
//     department: "Design",
//     salary: 73000,
//     phone: "+1-555-0113",
//   },
// ];

const dataSource = [
  {
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
    testing: "test1",
    email: "mike@example.com",
    status: "Active",
    department: "Engineering",
    salary: 75000,
    phone: "+1-555-0101",
  },
  {
    name: "John",
    age: 42,
    address: "10 Downing Street",
    testing: "test2",
    email: "john@example.com",
    status: "Active",
    department: "Marketing",
    salary: 68000,
    phone: "+1-555-0102",
  },
  {
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
    testing: "test3",
    email: "mike@example.com",
    status: "Active",
    department: "Engineering",
    salary: 75000,
    phone: "+1-555-0101",
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
  const parentRef = useRef(null);

  const data = addIterationColumnToTable(dataSource);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  //x -> direction should be scrolling till the last columm
  return (
    <div ref={parentRef} className="parsed-table-view-container">
      <ContentListTable
        id="parsed-file-preview-table"
        data={rowVirtualizer.getVirtualItems().map((row) => data[row.index])}
        columns={columns}
        className="parsed-values-table"
        locale={{ emptyText: `No entries found` }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default withContentListTableContext(PreviewTableView);

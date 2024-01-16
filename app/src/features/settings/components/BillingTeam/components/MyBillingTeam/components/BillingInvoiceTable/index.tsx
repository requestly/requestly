import React from "react";
import { Col, Table } from "antd";
import "./index.scss";

export const BillingInvoiceTable: React.FC = () => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <>{text}</>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        //  ADD INVOICE STATUS AND DOWNLOAD INVOICE BUTTON
        <></>
      ),
    },
  ];

  const dataSource = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
      tags: ["nice", "developer"],
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
      tags: ["loser"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
  ];
  return (
    <Col className="billing-teams-primary-card">
      <Col className="text-bold text-white billing-invoice-table-title">Billing history and invoices</Col>
      <Table
        className="billing-table my-billing-team-members-table"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ y: "30vh" }}
      />
    </Col>
  );
};

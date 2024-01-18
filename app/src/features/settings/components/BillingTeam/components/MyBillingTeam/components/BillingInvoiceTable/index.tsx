import React, { useEffect, useState } from "react";
import { Col, Table } from "antd";
import "./index.scss";
import { useParams } from "react-router-dom";
import { getBillingTeamInvoices } from "backend/billing";
import { getLongFormatDateString } from "utils/DateTimeUtils";

export const BillingInvoiceTable: React.FC = () => {
  const { billingId } = useParams();

  const [invoices, setInvoices] = useState([]);

  const columns = [
    {
      title: "Date",
      dataIndex: "created",
      key: "created",
      render: (created: number) => <>{getLongFormatDateString(new Date(created * 1000))}</>,
    },
    {
      title: "Description",
      dataIndex: "number",
      key: "number",
      render: (invoiceNumber: string) => <>{invoiceNumber}</>,
    },
    {
      title: "Amount",
      dataIndex: "total",
      key: "total",
      render: (amount: number) => <>{`$${amount / 100}`}</>,
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

  useEffect(() => {
    getBillingTeamInvoices(billingId).then(setInvoices);
  }, [billingId]);

  return (
    <Col className="billing-teams-primary-card">
      <Col className="text-bold text-white billing-invoice-table-title">Billing history and invoices</Col>
      <Table
        className="billing-table my-billing-team-members-table"
        dataSource={invoices}
        columns={columns}
        pagination={false}
        scroll={{ y: "30vh" }}
      />
    </Col>
  );
};

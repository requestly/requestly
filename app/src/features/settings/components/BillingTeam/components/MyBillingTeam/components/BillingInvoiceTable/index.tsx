import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Table } from "antd";
import { useParams } from "react-router-dom";
import { getBillingTeamInvoices } from "backend/billing";
import { RQButton } from "lib/design-system/components";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { MdOutlineVerified } from "@react-icons/all-files/md/MdOutlineVerified";
import { BiSolidHourglassTop } from "@react-icons/all-files/bi/BiSolidHourglassTop";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { redirectToUrl } from "utils/RedirectionUtils";
import Logger from "lib/logger";
import "./index.scss";
import { trackBillingTeamActionClicked } from "features/settings/analytics";

export const BillingInvoiceTable: React.FC = () => {
  const { billingId } = useParams();

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "created",
        key: "created",
        render: (created: number) => (
          <div className="text-white">{getLongFormatDateString(new Date(created * 1000))}</div>
        ),
      },
      {
        title: "Description",
        dataIndex: "number",
        key: "number",
        render: (invoiceNumber: string, record: any) => (
          <div className="text-white text-bold">{invoiceNumber ?? record.id}</div>
        ),
      },
      {
        title: "Amount",
        dataIndex: "total",
        key: "total",
        render: (amount: number, record: any) => (
          <div className="text-white">{`${record.currency === "usd" ? "$" : record.currency} ${amount / 100}`}</div>
        ),
      },
      {
        title: "",
        key: "action",
        render: (_: any, record: any) => (
          <Row align="middle" justify="end" gutter={16} className="items-center w-full">
            <Col>
              {record.status === "paid" ? (
                <div className="success invoice-status-label">
                  <MdOutlineVerified /> Paid
                </div>
              ) : (
                <div className="warning invoice-status-label">
                  <BiSolidHourglassTop /> Pending
                </div>
              )}
            </Col>
            {record.status === "paid" && (
              <Col>
                <RQButton
                  style={{ gap: "6px", fontWeight: 500 }}
                  type="default"
                  size="small"
                  icon={<MdOutlineFileDownload />}
                  onClick={() => {
                    trackBillingTeamActionClicked("download_invoice");
                    redirectToUrl(record.hosted_invoice_url, true);
                  }}
                >
                  Invoice
                </RQButton>
              </Col>
            )}
          </Row>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    setIsLoading(true);
    getBillingTeamInvoices(billingId)
      .then(setInvoices)
      .catch((e) => {
        Logger.log(e);
      })
      .finally(() => setIsLoading(false));
  }, [billingId]);

  return (
    <Col className="billing-teams-primary-card">
      <Col className="text-bold text-white billing-invoice-table-title">Billing history and invoices</Col>
      <Table
        className="billing-table my-billing-team-invoice-table"
        dataSource={invoices}
        columns={columns}
        pagination={false}
        loading={isLoading}
        scroll={{ y: "30vh" }}
      />
    </Col>
  );
};

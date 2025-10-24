import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Button } from "antd";
import { isEmpty } from "lodash";
// Firebase
import firebaseApp from "../../../../../../../../firebase";
import {
  getFirestore,
  collection,
  doc,
  orderBy,
  query as firebaseQuery,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
// Sub Components
import SpinnerColumn from "../../../../../../../../components/misc/SpinnerColumn";
// UTILS
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { filterUniqueObjects } from "../../../../../../../../utils/FormattingHelper";
import InvoiceStatus from "./InvoiceStatus";
import ProTable from "@ant-design/pro-table";
import { trackPersonalSubscriptionInvoiceClicked } from "modules/analytics/events/misc/subscriptions";
import "./InvoiceTable.css";

const InvoiceTable = ({ mode, teamId }) => {
  const params = new URLSearchParams(window.location.search);
  const autoRefresh = params.has("autoRefresh") ? params.get("autoRefresh") === "true" : false;
  const invoicesCount = 10; // Initial Count only | TODO - SAGAR - Replace with Bootstrap Pagination Table
  const mountedRef = useRef(true);

  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [qs, setQs] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = (lastDoc) => {
    if (!user.loggedIn) return;

    if (!mode) return;
    setIsLoading(true);
    let records = [];
    const collectionName = mode === "individual" ? "individualSubscriptions" : "teams";
    const documentName = mode === "individual" ? user?.details?.profile?.uid : teamId;
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(doc(collection(db, collectionName), documentName), "invoices");

    let query = null;

    if (lastDoc) {
      query = firebaseQuery(collectionRef, orderBy("created", "desc"), startAfter(lastDoc), limit(invoicesCount));
    } else {
      query = firebaseQuery(collectionRef, orderBy("created", "desc"), limit(invoicesCount));
    }

    getDocs(query).then((documentSnapshots) => {
      if (!mountedRef.current) return null;
      if (documentSnapshots.empty) {
        setReachedEnd(true);
      } else {
        documentSnapshots.forEach((doc) => {
          if (!doc.data().number || !doc.data().hosted_invoice_url) return;
          records.push({
            id: doc.id,
            total: Math.round(doc.data().total / 100).toFixed(2),
            subTotal: Math.round(doc.data().subTotal / 100).toFixed(2),
            tax: Math.round((doc.data().tax || 0) / 100).toFixed(2),
            amountPaid: Math.round(doc.data().amountPaid / 100).toFixed(2),
            created: new Date(doc.data().created * 1000).toDateString(),
            periodStart: new Date(doc.data().periodStart * 1000).toDateString(),
            periodEnd: new Date(doc.data().periodEnd * 1000).toDateString(),
            currency: doc.data().currency,
            status: doc.data().status,
            hosted_invoice_url: doc.data().hosted_invoice_url,
            number: doc.data().number,
          });
        });
        if (records.length > 0) {
          setInvoices((invoices) => invoices.concat(records));
          setQs(documentSnapshots);
        }
      }
      setIsLoading(false);
    });
  };

  const stableFetchInvoices = useCallback(fetchInvoices, [mode, teamId, user?.details?.profile?.uid, user.loggedIn]);

  const renderLoader = () => <SpinnerColumn message="Loading your invoices" />;

  const renderEmptyInvoice = () => (
    <div className="subtitle">
      There are currently no invoices. If you have recently made a purchase, please wait a minute or two.
    </div>
  );

  const renderInvoiceStatus = (invoice) => {
    switch (invoice.status) {
      case "open":
        return (
          <Button
            size="sm"
            type="primary"
            className="invoice-pay-now-btn"
            onClick={(e) => window.open(invoice.hosted_invoice_url, "_blank")}
          >
            Pay now
          </Button>
        );
      case "paid":
        return <InvoiceStatus label="Paid" type={invoice.status} />;
      case "void":
        return <InvoiceStatus label="Cancelled" type={invoice.status} />;
      case "draft":
        return <InvoiceStatus label="Pending" type={invoice.status} />;
      case "uncollectible":
        return <InvoiceStatus label="Expired" type={invoice.status} />;
      default:
        return <InvoiceStatus label="Paid" type="paid" />;
    }
  };

  const renderTable = useCallback(() => {
    const filteredInvoices = filterUniqueObjects(invoices);
    return (
      <>
        <ProTable
          rowKey="id"
          options={false}
          pagination={false}
          search={false}
          dateFormatter={false}
          headerTitle={false}
          dataSource={filteredInvoices}
          className="invoice-details-table"
          columns={[
            {
              title: "Invoice ID",
              dataIndex: "number",
              render: (number, invoice) => {
                return (
                  <span>
                    <Button
                      type="link"
                      target="_blank"
                      rel="noreferrer"
                      className="invoice-url-link"
                      href={invoice.hosted_invoice_url}
                      onClick={() => trackPersonalSubscriptionInvoiceClicked()}
                    >
                      {number}
                    </Button>
                    {renderInvoiceStatus(invoice)}
                  </span>
                );
              },
            },
            {
              title: "Invoice Date",
              dataIndex: "created",
            },
            {
              title: "Amount",
              render: (_, invoice) => {
                return (
                  <span className="font-weight-bold" style={{ textTransform: "uppercase" }}>{`${invoice.currency} $${
                    parseInt(invoice.total) > 0 ? parseInt(invoice.total) : 0
                  }`}</span>
                );
              },
            },
            {
              title: "Subscription Period",
              render: (_, invoice) => {
                return `${invoice.periodStart} - ${invoice.periodEnd}`;
              },
            },
          ]}
        />
        <br />
        {reachedEnd ? (
          <div className="text-sm text-dark-gray text-center">No more invoices</div>
        ) : (
          <Button
            type="link"
            onClick={() => stableFetchInvoices(qs.docs[qs.docs.length - 1])}
            className="invoice-table-view-past-invoice-btn"
          >
            View Past Invoices
          </Button>
        )}
      </>
    );
  }, [reachedEnd, invoices, qs?.docs, stableFetchInvoices]);

  useEffect(() => {
    stableFetchInvoices();
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchInvoices]);

  //Auto refresh Invoice Table if it is empty
  useEffect(() => {
    if (autoRefresh) {
      let intervalID = setInterval(() => {
        if (isEmpty(invoices)) {
          stableFetchInvoices();
        }
      }, 2000);
      return () => {
        clearInterval(intervalID);
      };
    }
  }, [invoices, stableFetchInvoices, autoRefresh]);

  return (
    <>
      <Row>
        <Col span={24}>{isLoading ? renderLoader() : isEmpty(invoices) ? renderEmptyInvoice() : renderTable()}</Col>
      </Row>
    </>
  );
};

export default InvoiceTable;

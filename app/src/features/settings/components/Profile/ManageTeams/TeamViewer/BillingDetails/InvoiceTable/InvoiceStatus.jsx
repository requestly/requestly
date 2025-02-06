import React from "react";

const InvoiceStatus = ({ type = "paid", label = "" }) => {
  const invoiceTypeIcon = {
    paid: "check.svg",
    void: "cross.svg",
    draft: "pending.svg",
    uncollectible: "cross.svg",
  };

  const invoicesStatusColor = {
    paid: "#00C8AF",
    draft: "#FF6905",
    overdue: "#FA2828",
  };

  return (
    <span className="invoice-status-data">
      <img alt={label} className="invoice-status-icon" src={`/assets/media/common/${invoiceTypeIcon[type]}`} />
      <span className="invoice-status-label" style={{ color: invoicesStatusColor[type] }}>
        {label}
      </span>
    </span>
  );
};

export default InvoiceStatus;

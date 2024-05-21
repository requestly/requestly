import React from "react";
import { Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import emptyWallet from "./empty_wallet.svg";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import "./redeemCreditsModal.scss";

export const RedeemCreditsModal: React.FC = () => {
  const isEmpty = false; // TODO: remove this
  const totalCreditsEarned = 105;

  const planSummary = [
    {
      label: "Plan name",
      value: "Professional team plan",
    },
    {
      label: "Duration",
      value: "3 months and 14 days",
    },
    {
      label: "Start date",
      value: "Dec 25, 2024",
    },
    {
      label: "Renewal date",
      value: "Mar 11, 2024",
    },
  ];

  return (
    <Modal
      closable={!isEmpty}
      width={isEmpty ? 480 : 416}
      open={true}
      footer={null}
      title={isEmpty ? null : "Redeem credits and upgrade"}
      className={`custom-rq-modal redeem-credits-modal ${isEmpty ? "empty" : ""}`}
    >
      {isEmpty ? (
        <div className="credits-not-available">
          <div className="content">
            <img width={100} height={100} className="empty-wallet" src={emptyWallet} alt="Empty wallet" />
            <div className="title">No credits available!</div>
            <div className="description">
              You don't have any credits available now. Please complete your Requestly setup and get $120 Free credits
              for Requestly Pro plan.
            </div>
          </div>
          <div className="actions">
            <RQButton type="primary" onClick={() => {}}>
              Setup & earn credits
            </RQButton>
            <RQButton type="text">I'll do it later</RQButton>
          </div>
        </div>
      ) : (
        <div className="credits-available">
          <div className="content">
            <div className="description">
              You have earned <span className="credits-earned">${totalCreditsEarned} credits</span> till now. Use your
              credits to upgrade to Requestly Pro plan.
            </div>
            <div className="details">
              <div className="plan-summary-title">
                <span className="title">Plan summary</span>

                <div className="plan-details">
                  <RiInformationLine /> Plan details
                </div>
              </div>

              <div className="summary-container">
                {planSummary.map(({ label, value }, index) => {
                  return (
                    <div key={index} className="summary-item">
                      <span className="label">{label}</span>
                      <span className="value">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="actions">
            <RQButton onClick={() => {}}>Cancel</RQButton>
            <RQButton type="primary">Redeem & upgrade</RQButton>
          </div>
        </div>
      )}
    </Modal>
  );
};

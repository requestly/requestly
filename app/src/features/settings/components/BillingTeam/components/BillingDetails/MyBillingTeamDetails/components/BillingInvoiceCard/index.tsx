import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Col } from "antd";
import invoiceIcon from "../../../../../assets/invoice.svg";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import {
  trackBillingTeamInvoiceRequestClicked,
  trackBillingTeamInvoiceRequestFailed,
  trackBillingTeamInvoiceRequestSent,
} from "features/settings/analytics";
import "./index.scss";

export const BillingInvoiceCard: React.FC = () => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestProcessed, setIsRequestProcessed] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const handleSendInvoiceRequest = useCallback(() => {
    setIsLoading(true);
    setIsRequestProcessed(false);
    trackBillingTeamInvoiceRequestClicked(billingId);
    const sendInvoiceRequest = httpsCallable(getFunctions(), "internalNotifications-sendBillingTeamInvoiceRequest");
    sendInvoiceRequest({ billingId })
      .then(() => {
        setIsLoading(false);
        setIsRequestSent(true);
        setIsRequestProcessed(true);
        trackBillingTeamInvoiceRequestSent(billingId);
      })
      .catch(() => {
        setIsLoading(false);
        setIsRequestProcessed(true);
        trackBillingTeamInvoiceRequestFailed(billingId);
      });
  }, [billingId]);

  return (
    <Col className="billing-teams-primary-card billing-team-invoice-card">
      <div className="billing-team-invoice-card-body">
        <img src={invoiceIcon} alt="invoice" />
        <div className="text-bold text-white billing-invoice-card-title">Get your invoice via email</div>
        <div className="text-bold text-white billing-invoice-card-description">
          We will send invoice to your registered email address, {user?.details?.profile?.email}.
        </div>
        {isRequestProcessed ? (
          isRequestSent ? (
            <div className="request-result success">
              {" "}
              <MdCheckCircleOutline /> Request sent successfully, invoice will be sent shortly.
            </div>
          ) : (
            <div className="request-result error">
              <MdErrorOutline /> Couldn't send the email. Please retry or contact us
            </div>
          )
        ) : null}
        <RQButton type="default" loading={isLoading} onClick={handleSendInvoiceRequest}>
          Get Invoice
        </RQButton>
      </div>

      <div className="billing-team-invoice-card-footer">
        Need any help? Get in touch with us at <a href="mailto:contact@requestly.io">contact@requestly.io</a>
      </div>
    </Col>
  );
};

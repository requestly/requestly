import React, { useState } from "react";
import { Divider } from "antd";
import {
  EVENTS,
  trackBuyAdditionalUsersButtonClicked,
  trackRequestQuoteButtonClicked,
  trackSendPurhcaseOrderButtonClicked,
} from "./analytics";
import RequestQuoteModal from "./RequestQuoteModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import SendPurchaseOrderModal from "./SendPurchaseOrderModal";
import { PurchaseOption } from "./PurchaseOption";
import Logger from "lib/logger";
import BuyAdditionalSeatsModal from "./BuyAdditionalSeatsModal";
import "./OtherWaysToMakePurchase.scss";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";

const OtherWaysToMakePurchase: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const [isRequestQuoteModalOpen, setIsRequestQuoteModalOpen] = useState(false);
  const [isSendPurchaseOrderModalOpen, setIsSendPurchaseOrderModalOpen] = useState(false);
  const [isBuyAdditionalSeatsModalOpen, setIsBuyAdditionalSeatsModalOpen] = useState(false);

  const handleRequestQuoteOnClick = () => {
    if (user.loggedIn) {
      trackRequestQuoteButtonClicked();
      const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
      try {
        salesInboundNotification({
          notificationText: EVENTS.REQUEST_QUOTE_BUTTON_CLICKED,
        });
      } catch (error) {
        console.error(error);
      }
    }
    setIsRequestQuoteModalOpen(true);
  };

  const handleSendPurchaseOrderButtonOnClick = () => {
    if (user.loggedIn) {
      trackSendPurhcaseOrderButtonClicked();
      const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
      try {
        salesInboundNotification({
          notificationText: EVENTS.SEND_PURCHASE_ORDER_BUTTON_CLICKED,
        });
      } catch (error) {
        console.error(error);
      }
    }
    setIsSendPurchaseOrderModalOpen(true);
  };

  const handleBuyAdditionalUsersButtonOnClick = () => {
    if (user.loggedIn) {
      trackBuyAdditionalUsersButtonClicked();
      const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
      try {
        salesInboundNotification({
          notificationText: EVENTS.BUY_ADDITIONAL_USERS_BUTTON_CLICKED,
        });
      } catch (error) {
        Logger.error("Failed to send sales inbound notification", error);
      }
    }
    setIsBuyAdditionalSeatsModalOpen(true);
  };

  return (
    <>
      <RequestQuoteModal
        isOpen={isRequestQuoteModalOpen}
        handleToggleModal={() => setIsRequestQuoteModalOpen(!isRequestQuoteModalOpen)}
      />

      <SendPurchaseOrderModal
        isOpen={isSendPurchaseOrderModalOpen}
        handleToggleModal={() => setIsSendPurchaseOrderModalOpen(!isSendPurchaseOrderModalOpen)}
      />

      <BuyAdditionalSeatsModal
        isOpen={isBuyAdditionalSeatsModalOpen}
        handleToggleModal={() => setIsBuyAdditionalSeatsModalOpen(!isBuyAdditionalSeatsModalOpen)}
      />

      <div className="other-ways-to-make-purchase-container">
        <div className="title">Other ways to make a purchase</div>

        <div className="details">
          <div className="first-row">
            <PurchaseOption
              title="Request a Quote"
              description="Fill in your details and you'll be sent a quote/estimate to sign. Once it's signed and returned, we’ll activate your licenses and send you an invoice with NET 30 payment terms."
              action={{ text: "Request a Quote", handler: handleRequestQuoteOnClick }}
            />
            <PurchaseOption
              title="Send a Purchase Order"
              description="Please review our PO Requirements to ensure streamlined processing of your PO. Once received and processed, we’ll activate your licenses and send you an invoice with NET 30 payment terms."
              action={{ text: "Send a Purchase Order", handler: handleSendPurchaseOrderButtonOnClick }}
            />
          </div>

          <Divider />

          <PurchaseOption
            title="Want to Add Seats to Your Existing Subscription?"
            description="You can purchase additional seats at a prorated cost, which will be calculated based on the remaining duration of your current subscription."
            action={{ text: "Buy Additional Users", handler: handleBuyAdditionalUsersButtonOnClick }}
          />
        </div>
      </div>
    </>
  );
};

export default OtherWaysToMakePurchase;

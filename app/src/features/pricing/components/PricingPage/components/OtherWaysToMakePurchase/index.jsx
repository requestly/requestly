import React, { useState } from "react";
import { Card, Col, Row, Typography } from "antd";
import { FileTextOutlined, FileAddOutlined } from "@ant-design/icons";
import { EVENTS, trackRequestQuoteButtonClicked, trackSendPurhcaseOrderButtonClicked } from "./analytics";
import RequestQuoteModal from "./RequestQuoteModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import SendPurchaseOrderModal from "./SendPurchaseOrderModal";
import { RQButton } from "lib/design-system/components";

const { Title, Text } = Typography;

const styles = {
  container: {
    marginTop: "56px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "var(--requestly-font-size-xl)",
    fontWeight: 500,
    color: "var(--requestly-color-text-default)",
  },
  card: {
    height: "100%",
    background: "var(--requestly-color-surface-0)",
    borderRadius: "8px",
    border: "1px solid var(--requestly-color-white-t-20)",
  },
  link: {
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    fontWeight: "bolder",
  },
  icon: {
    fontSize: "1.2em",
    marginRight: "8px",
  },
  text: {
    color: "var(--neutrals-gray-300)",
    display: "block",
    minHeight: "66px",
  },
  divider: {
    height: "100%",
  },
};

const OtherWaysToMakePurchase = () => {
  const [isRequestQuoteModalOpen, setIsRequestQuoteModalOpen] = useState(false);
  const [isSendPurchaseOrderModalOpen, setIsSendPurchaseOrderModalOpen] = useState(false);

  const handleRequestQuoteOnClick = () => {
    trackRequestQuoteButtonClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.REQUEST_QUOTE_BUTTON_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    setIsRequestQuoteModalOpen(true);
  };

  const handleSendPurchaseOrderButtonOnClick = () => {
    trackSendPurhcaseOrderButtonClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.SEND_PURCHASE_ORDER_BUTTON_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    setIsSendPurchaseOrderModalOpen(true);
  };

  return (
    <>
      <div style={styles.container}>
        <Title level={2} style={styles.heading}>
          Other Ways to Make a Purchase
        </Title>
        <Row justify="center" align="middle" gutter={[16, 16]}>
          <Col lg={12} sm={24}>
            <Card style={styles.card}>
              <div style={styles.link}>
                <FileTextOutlined style={styles.icon} />
                Request a Quote
              </div>
              <Text style={styles.text}>
                Fill in your details and you’ll be sent a quote/estimate to sign. Once it’s signed and returned, we’ll
                activate your licenses and send you an invoice with NET 30 payment terms.
              </Text>
              <RQButton type="primary" className="mt-24" onClick={handleRequestQuoteOnClick}>
                Request a Quote
              </RQButton>
            </Card>
          </Col>

          <Col lg={12} sm={24}>
            <Card style={styles.card}>
              <div style={styles.link}>
                <FileAddOutlined style={styles.icon} />
                Send a Purchase Order
              </div>
              <Text style={styles.text}>
                Please review our PO Requirements to ensure streamlined processing of your PO. Once received and
                processed, we’ll activate your licenses and send you an invoice with NET 30 payment terms.
              </Text>
              <RQButton type="primary" className="mt-24" onClick={handleSendPurchaseOrderButtonOnClick}>
                Send Purchase Order
              </RQButton>
            </Card>
          </Col>
        </Row>
      </div>
      <RequestQuoteModal
        isOpen={isRequestQuoteModalOpen}
        handleToggleModal={() => setIsRequestQuoteModalOpen(!isRequestQuoteModalOpen)}
      />
      <SendPurchaseOrderModal
        isOpen={isSendPurchaseOrderModalOpen}
        handleToggleModal={() => setIsSendPurchaseOrderModalOpen(!isSendPurchaseOrderModalOpen)}
      />
    </>
  );
};

export default OtherWaysToMakePurchase;

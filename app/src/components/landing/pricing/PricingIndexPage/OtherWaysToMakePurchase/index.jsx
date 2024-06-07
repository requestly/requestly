import React, { useState } from "react";
import { Card, Col, Row, Typography, Divider } from "antd";
import { ArrowRightOutlined, FileTextOutlined, FileAddOutlined } from "@ant-design/icons";
import { EVENTS, trackRequestQuoteButtonClicked, trackSendPurhcaseOrderButtonClicked } from "./analytics";
import RequestQuoteModal from "./RequestQuoteModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import SendPurchaseOrderModal from "./SendPurchaseOrderModal";

const { Title, Text, Link } = Typography;

const styles = {
  container: {
    padding: "40px 10px",
    maxWidth: "70vw",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "40px",
  },
  card: {
    height: "100%",
    background: "var(--component-background)",
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
          <Col xs={24} md={10}>
            <Card style={styles.card}>
              <Link style={styles.link} onClick={handleRequestQuoteOnClick}>
                <FileTextOutlined style={styles.icon} />
                Request a Quote &nbsp; <ArrowRightOutlined />
              </Link>
              <Text style={styles.text}>
                Fill in your details and you’ll be sent a quote/estimate to sign. Once it’s signed and returned, we’ll
                activate your licenses and send you an invoice with NET 30 payment terms.
              </Text>
            </Card>
          </Col>
          <Col xs={0} md={1}>
            <Divider type="vertical" style={styles.divider} />
          </Col>
          <Col xs={24} md={10}>
            <Card style={styles.card}>
              <Link style={styles.link} onClick={handleSendPurchaseOrderButtonOnClick}>
                <FileAddOutlined style={styles.icon} />
                Send a Purchase Order &nbsp; <ArrowRightOutlined />
              </Link>
              <Text style={styles.text}>
                Please review our PO Requirements to ensure streamlined processing of your PO. Once received and
                processed, we’ll activate your licenses and send you an invoice with NET 30 payment terms.
              </Text>
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

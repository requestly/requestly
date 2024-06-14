import React, { useState } from "react";
import { Button, Card, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { FaUsers } from "@react-icons/all-files/fa/FaUsers";
import { EVENTS, trackClaimVolumeDiscountsCTAClicked } from "./analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import ContactUsModal from "components/landing/contactUsModal";

const { Title, Text } = Typography;
const styles = {
  card: {
    width: "100%",
    textAlign: "center",
    padding: "20px",
    background: "var(--requestly-color-surface-0)",
    borderRadius: "8px",
    border: "1px solid var(--requestly-color-white-t-20)",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: "40px",
    marginRight: "20px",
  },
  textContainer: {
    flex: 1,
    marginRight: "20px",
    textAlign: "left",
  },
  title: {
    fontWeight: "bold",
    marginBottom: "0px",
  },
  subtitle: {
    marginBottom: "0px",
    color: "var(--neutrals-gray-300)",
  },
  button: {
    marginTop: "1rem",
    padding: "0 20px",
  },
};

const HowToClaimVolumeDiscounts = () => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);

  const handleCTAOnClick = () => {
    trackClaimVolumeDiscountsCTAClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.CLAIM_VOLUME_DISCOUNTS_CTA_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    setIsContactUsModalOpen(true);
  };

  return (
    <>
      <div style={styles.bannerContainer}>
        <Card style={styles.card}>
          <div style={styles.content}>
            <FaUsers style={styles.icon} />
            <div style={styles.textContainer}>
              <Title level={2} style={styles.title}>
                How to Claim Volume Discounts
              </Title>
              <Text style={styles.subtitle}>
                Enjoy flexible pricing tailored to your needs. For discounts on 50+ licenses, email us at &nbsp;
                <a href="mailto:sales@requestly.io">sales@requestly.io</a>. Get the best pricing with our volume
                discount.
              </Text>
            </div>
            <Button type="primary" icon={<MailOutlined />} onClick={handleCTAOnClick} style={styles.button}>
              Schedule a call
            </Button>
          </div>
        </Card>
      </div>
      <ContactUsModal
        isOpen={isContactUsModalOpen}
        handleToggleModal={() => setIsContactUsModalOpen(!isContactUsModalOpen)}
      />
    </>
  );
};

export default HowToClaimVolumeDiscounts;

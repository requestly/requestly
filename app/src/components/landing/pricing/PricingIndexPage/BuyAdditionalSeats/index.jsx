import React, { useState } from "react";
import underlineIcon from "features/pricing/assets/yellow-highlight.svg";
import { Button, Card, Col, Row, Typography } from "antd";
import enterpriseImage from "assets/images/illustrations/enterprise-banner.png";
import { RQButton } from "lib/design-system/components";
import { FaUserPlus } from "@react-icons/all-files/fa6/FaUserPlus";
import { EVENTS, trackBuyAdditionalUsersButtonClicked } from "./analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import BuyAdditionalSeatsModal from "./BuyAdditionalSeatsModal";

const styles = {
  bannerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    margin: "20px 0",
  },
  card: {
    width: "100%",
    maxWidth: "60vw",
    textAlign: "center",
    padding: "20px",
    background: "var(--surface-2)",
    borderRadius: "var(--border-radius-md)",
  },
  content: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
    padding: "0 20px",
  },
};

const BuyAdditionalSeats = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleBuyAdditionalUsersButtonOnClick = () => {
    trackBuyAdditionalUsersButtonClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "salesInboundNotification");
    try {
      salesInboundNotification({
        notificationText: EVENTS.BUY_ADDITIONAL_USERS_BUTTON_CLICKED,
      });
    } catch (error) {
      console.error(error);
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div style={styles.bannerContainer}>
        <Card style={styles.card}>
          <div style={styles.content}>
            <FaUserPlus style={styles.icon} />
            <div style={styles.textContainer}>
              <h2 style={styles.title}>Want to Add Seats to Your Existing Subscription?</h2>
              <p style={styles.subtitle}>
                Purchase new seats at a prorated price up until the end of the subscription.
              </p>
            </div>
            <Button type="primary" style={styles.button} onClick={handleBuyAdditionalUsersButtonOnClick}>
              Buy Additional Users
            </Button>
          </div>
        </Card>
      </div>
      <BuyAdditionalSeatsModal isOpen={isModalOpen} handleToggleModal={handleToggleModal} />
    </>
  );
};

export default BuyAdditionalSeats;

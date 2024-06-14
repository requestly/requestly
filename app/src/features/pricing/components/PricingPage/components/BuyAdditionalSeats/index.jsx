import React, { useState } from "react";
import { Button, Card } from "antd";
import { FaUserPlus } from "@react-icons/all-files/fa6/FaUserPlus";
import { EVENTS, trackBuyAdditionalUsersButtonClicked } from "./analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import BuyAdditionalSeatsModal from "./BuyAdditionalSeatsModal";

const styles = {
  card: {
    width: "100%",
    height: "100%",
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

const BuyAdditionalSeats = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleBuyAdditionalUsersButtonOnClick = () => {
    trackBuyAdditionalUsersButtonClicked();
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
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
                You can purchase additional seats at a prorated cost, which will be calculated based on the remaining
                duration of your current subscription.
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

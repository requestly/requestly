import { Form, Input, Result, Spin } from "antd";
import { RQButton, RQModal } from "lib/design-system/components";
import React, { useState } from "react";
import { generateSupportTicketNumber } from "utils/Misc";
import { getFunctions, httpsCallable } from "firebase/functions";
import { EVENTS, trackBuyAdditionalUsersFormSubmitted } from "./analytics";

const BuyAdditionalSeatsModal = ({ isOpen, handleToggleModal }) => {
  const [formState, setFormState] = useState("form"); // 'form', 'loading', 'success'

  const handleSubmit = async (values) => {
    trackBuyAdditionalUsersFormSubmitted();
    setFormState("loading");
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      await salesInboundNotification({
        notificationText: `${EVENTS.BUY_ADDITIONAL_USERS_FORM_SUBMITTED} trigged with company name ${
          values.companyName
        }, team name ${values?.teamName || "NOT PROVIDED"}, email ${values.email} and additional seats count ${
          values.additionalSeats
        }`,
      });
    } catch (error) {
      console.error(error);
    }
    setFormState("success");
  };

  const styles = {
    formItem: {
      marginBottom: "16px",
    },
    submitButton: {
      width: "100%",
    },
    successMessage: {
      textAlign: "center",
    },
    loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
  };

  return (
    <RQModal centered title="Add seats to your existing subscription" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        {formState === "form" && (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="companyName"
              label="Your Company Name"
              rules={[{ required: true, message: "Please enter your company name" }]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
            <Form.Item name="teamName" label="Your Team Name (optional)" style={styles.formItem}>
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Your Email Address"
              rules={[
                { required: true, message: "Please enter your email address" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="additionalSeats"
              label="Number of Additional Seats"
              rules={[{ required: true, message: "Please enter the number of additional seats" }]}
              style={styles.formItem}
            >
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <RQButton type="primary" htmlType="submit" style={styles.submitButton}>
                Buy Additional Seats
              </RQButton>
            </Form.Item>
          </Form>
        )}
        {formState === "loading" && (
          <div style={styles.loader}>
            <Spin size="large" />
          </div>
        )}
        {formState === "success" && (
          <Result
            status="success"
            title={`Additional seats requested`}
            subTitle={
              <p>
                {`Support ticket #${generateSupportTicketNumber()}.`}
                <br /> {`Our team will get back to you via email within 8 hours.`}
              </p>
            }
          />
        )}
      </div>
    </RQModal>
  );
};

export default BuyAdditionalSeatsModal;

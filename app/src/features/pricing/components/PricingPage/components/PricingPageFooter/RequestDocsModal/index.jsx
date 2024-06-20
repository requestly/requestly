import React, { useState } from "react";
import { Form, Input, Checkbox, Result, Spin } from "antd";
import { RQButton, RQModal } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { EVENTS } from "./analytics";
import { trackRequestDocumentClicked } from "./analytics";

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
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
  },
};

const RequestDocsModal = ({ isOpen, handleToggleModal }) => {
  const [formState, setFormState] = useState("form"); // 'form', 'loading', 'success'

  const handleSubmit = async (values) => {
    trackRequestDocumentClicked();
    setFormState("loading");
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      await salesInboundNotification({
        notificationText: `${EVENTS.REQUEST_DOCUEMNT_FORM_SUBMMITTED} triggered with email ${
          values.email
        } and requested documents ${values.documents.join(", ")}`,
      });
    } catch (error) {
      console.error(error);
    }
    setFormState("success");
  };

  return (
    <RQModal centered title="Request Documents" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        {formState === "form" && (
          <Form layout="vertical" onFinish={handleSubmit}>
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
              name="documents"
              label="Select Documents"
              rules={[{ required: true, message: "Please select at least one document" }]}
              style={styles.formItem}
            >
              <Checkbox.Group style={styles.checkboxGroup}>
                <Checkbox value="SOC2 Report">SOC2 Report</Checkbox>
                <Checkbox value="Pen Testing Report">Pen Testing Report</Checkbox>
                <Checkbox value="Data Privacy Agreement">Data Privacy Agreement</Checkbox>
                <Checkbox value="W9 Form">W9 Form</Checkbox>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <RQButton type="primary" htmlType="submit" style={styles.submitButton}>
                Request Documents
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
            title="Documents requested"
            subTitle="We will get back to you via email within 8 hours."
          />
        )}
      </div>
    </RQModal>
  );
};

export default RequestDocsModal;

import { Form, Input, Result, Radio, Spin, Select } from "antd";
import { RQButton, RQModal } from "lib/design-system/components";
import React, { useState } from "react";
import { generateSupportTicketNumber } from "utils/Misc";
import { getFunctions, httpsCallable } from "firebase/functions";
import { EVENTS } from "./analytics";
import { trackRequestQuoteFormSubmitted } from "./analytics";

const RequestQuoteModal = ({ isOpen, handleToggleModal }) => {
  const [formState, setFormState] = useState("form"); // 'form', 'loading', 'success'

  const handleSubmit = async (values) => {
    trackRequestQuoteFormSubmitted();
    setFormState("loading");
    const salesInboundNotification = httpsCallable(getFunctions(), "premiumNotifications-salesInboundNotification");
    try {
      await salesInboundNotification({
        notificationText: `${EVENTS.REQUEST_QUOTE_FORM_SUBMITTED} triggered with document type ${values.documentType}, purchase type ${values.purchaseType}, number of licenses ${values.numberOfLicenses}, subscription period ${values.subscriptionPeriod}, company name ${values.companyName}, and email ${values.email}`,
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
    <RQModal centered title="Request a Quote" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        {formState === "form" && (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="documentType"
              label="Type of Document"
              rules={[{ required: true, message: "Please select the type of document" }]}
              style={styles.formItem}
            >
              <Radio.Group>
                <Radio value="quotation">Quotation/Estimate</Radio>
                <Radio value="proforma">Proforma Invoice</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="purchaseType"
              label="Type of Purchase"
              rules={[{ required: true, message: "Please select the type of purchase" }]}
              style={styles.formItem}
            >
              <Radio.Group>
                <Radio value="newLicense">New License</Radio>
                <Radio value="licenseUpdate">License Update</Radio>
                <Radio value="licenseRenewal">License Renewal</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="numberOfLicenses"
              label="Number of Licenses"
              rules={[{ required: true, message: "Please enter the number of licenses" }]}
              style={styles.formItem}
            >
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item
              name="subscriptionPeriod"
              label="Subscription Period"
              rules={[{ required: true, message: "Please select the subscription period" }]}
              style={styles.formItem}
            >
              <Select>
                <Select.Option value="1">1 year</Select.Option>
                <Select.Option value="2">2 years</Select.Option>
                <Select.Option value="3">3 years</Select.Option>
                <Select.Option value="4">4 years</Select.Option>
                <Select.Option value="5">5 years</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: "Please enter your company name" }]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter your email address" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <RQButton type="primary" htmlType="submit" style={styles.submitButton}>
                Request Quote
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
            title={`Quote requested`}
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

export default RequestQuoteModal;

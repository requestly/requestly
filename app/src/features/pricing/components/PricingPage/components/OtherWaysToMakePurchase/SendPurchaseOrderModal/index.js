import React from "react";
import { Modal, Typography } from "antd";
import { RQButton, RQModal } from "lib/design-system/components";

const { Text, Title, Paragraph } = Typography;

const SendPurchaseOrderModal = ({ isOpen, handleToggleModal }) => {
  const styles = {
    email: {
      fontWeight: "bold",
    },
  };

  return (
    <RQModal centered title="Send Purchase Order" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        <Title level={4}>Please address the Purchase Order to:</Title>
        <Paragraph>
          RQ Labs, Inc.
          <br />
          355 Bryant St Unit 403
          <br />
          San Francisco, CA 94107
        </Paragraph>

        <Title level={4}>Include information about your company:</Title>
        <Paragraph>
          <Text>
            <ul>
              <li>Company Name</li>
              <li>Billing Email Address</li>
              <li>Tax ID</li>
            </ul>
          </Text>
        </Paragraph>

        <Title level={4}>Mention the Payment Terms:</Title>
        <Paragraph>
          <Text>Net 30 or Net 60</Text>
        </Paragraph>

        <Title level={4}>Include the purchase details:</Title>
        <Paragraph>
          <Text>
            <ul>
              <li>License Type (Basic or Professional)</li>
              <li>Quantity of licenses</li>
              <li>Duration of subscription</li>
            </ul>
          </Text>
        </Paragraph>

        <Title level={4}>Submission Instructions:</Title>
        <Paragraph>
          Please send the Purchase Order to <Text style={styles.email}>sales@requestly.io</Text> and we'll process it
          within 1 business day.
        </Paragraph>
      </div>
    </RQModal>
  );
};

export default SendPurchaseOrderModal;

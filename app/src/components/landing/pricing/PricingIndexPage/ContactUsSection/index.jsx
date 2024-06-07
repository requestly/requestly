import React, { useState } from "react";
import { RQButton } from "lib/design-system/components";
import ContactUsModal from "components/landing/contactUsModal";
import "./index.css";
import { Row, Col } from "antd";

const ContactUsSection = () => {
  const [isContactUsModalOpen, setIsContactUsModalOpen] = useState(false);
  return (
    <Row>
      <Col span={12} offset={6}>
        <div className="more-questions-container">
          <div className="header text-gray">Still have more questions?</div>
          <RQButton type="primary" onClick={() => setIsContactUsModalOpen(true)}>
            Contact us
          </RQButton>
        </div>
        <ContactUsModal
          isOpen={isContactUsModalOpen}
          handleToggleModal={() => setIsContactUsModalOpen(!isContactUsModalOpen)}
        />
      </Col>
    </Row>
  );
};

export default ContactUsSection;

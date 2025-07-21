import React from "react";
import { InlineWidget } from "react-calendly";
import { RQModal } from "lib/design-system/components";

const ContactUsModal = ({ isOpen, handleToggleModal }) => {
  return (
    <RQModal centered title="" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        <InlineWidget
          styles={{ height: "65vh", marginTop: "1px" }}
          url="https://calendly.com/requestly/sales"
          pageSettings={{
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
          }}
        />
      </div>
    </RQModal>
  );
};

export default ContactUsModal;

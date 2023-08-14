import React from "react";
import { InlineWidget } from "react-calendly";
import { RQModal } from "lib/design-system/components";

const ContactUsModal = ({ isOpen, handleToggleModal }) => {
  return (
    <RQModal centered title="" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        <div className="title">Contact us by scheduling a meeting</div>
        <InlineWidget
          styles={{ height: "602px", marginTop: "4px" }}
          url="https://calendly.com/requestly/sagar"
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

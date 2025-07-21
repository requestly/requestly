import React from "react";
import { InlineWidget } from "react-calendly";
import { RQModal } from "lib/design-system/components";

const ContactUsModal = ({ isOpen, handleToggleModal }) => {
  return (
    <RQModal centered title="" open={isOpen} onCancel={handleToggleModal}>
      <div className="rq-modal-content">
        <InlineWidget
          styles={{ height: "65vh", marginTop: "1px" }}
          url="https://www.browserstack.com/contact?utm_source=Requestly&utm_medium=redirect&utm_platform=external"
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

import React from "react";
import { Modal } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

const ContactUsModal = ({ isOpen, toggleModal }) => {
  return (
    <Modal style={{ marginTop: "200px" }} visible={isOpen} onCancel={toggleModal} footer={null}>
      <div>
        <h2>To Remove Team Member</h2>
      </div>
      <div>
        <h3>
          Please write to us at{" "}
          <a href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}>
            {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
          </a>{" "}
          and we'll revert you within 4-5 hours.
        </h3>
      </div>
    </Modal>
  );
};

export default ContactUsModal;

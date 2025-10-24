import React from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import MagicLinkModalContent from "./MagicLinkModalContent";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import "./index.css";

/*
TODO FIX:
THIS MODAL SHOULD NOT BE TOGGLED USING DISPATCH
IT SHOULD BE TOGGLED USING A LOCAL STATE
*/

const MailLoginLinkPopup = ({ isOpen, toggleModal, authMode, email, eventSource }) => {
  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  return email && isEmailValid(email) ? (
    <>
      <Modal
        size="small"
        open={!user.loggedIn && isOpen}
        onCancel={isOpen ? () => toggleModal() : null}
        footer={null}
        centered={true}
        closeIcon={null}
        maskStyle={{ background: "#0d0d10f9" }}
        bodyStyle={{ padding: "0" }}
        wrapClassName="mail-link-modal-wrapper"
        closable={false}
      >
        <button className="modal-back-btn-wrapper" onClick={() => toggleModal()}>
          <BiArrowBack alt="close-icon" />
          <span> Back</span>
        </button>
        <MagicLinkModalContent
          eventSource={eventSource}
          email={email}
          authMode={authMode}
          className="mail-link-modal-content"
        />
      </Modal>
    </>
  ) : (
    toast.error("Please enter a valid email address")
  );
};

export default MailLoginLinkPopup;

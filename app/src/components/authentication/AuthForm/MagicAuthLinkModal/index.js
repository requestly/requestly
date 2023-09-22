import React from "react";
import { useSelector } from "react-redux";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
//SUB COMPONENTS

//STYLES
// import "./AuthModal.css";
// import closeIcon from "assets/images/modal/close.svg";
import { getUserAuthDetails } from "store/selectors";
import MagicLinkModalContent from "./MagicLinkModalContent";
import { isEmailValid } from "utils/FormattingHelper";
import { toast } from "utils/Toast";
import "./index.css";
import { RQModal } from "lib/design-system/components";
const MailLoginLinkPopup = ({ isOpen, toggleModal, authMode, email, eventSource }) => {
  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);
  return email && isEmailValid(email) ? (
    <>
      <RQModal
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
        <BiArrowBack className="modal-back-btn" onClick={() => toggleModal()} alt="close-icon" />
        <MagicLinkModalContent
          eventSource={eventSource}
          email={email}
          authMode={authMode}
          className="mail-link-modal-content"
        />
      </RQModal>
    </>
  ) : (
    toast.error("Please enter a valid email address")
  );
};

export default MailLoginLinkPopup;

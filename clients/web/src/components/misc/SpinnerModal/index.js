import React from "react";
import { Modal } from "antd";
//SUB COMPONENTS
import SpinnerColumn from "../SpinnerColumn";

const SpinnerModal = (props) => {
  const { toggle: toggleModal, isOpen } = props;

  return (
    <Modal className="modal-dialog-centered " visible={isOpen} onCancel={toggleModal} footer={null}>
      <div className="modal-body ">
        <SpinnerColumn message="Loading" />
      </div>
    </Modal>
  );
};

export default SpinnerModal;

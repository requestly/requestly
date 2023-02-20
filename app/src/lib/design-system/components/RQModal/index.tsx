import { Modal, ModalProps } from "antd";
import React from "react";
import "./RQModal.css";

export const RQModal: React.FC<ModalProps> = (props) => {
  return (
    <Modal
      {...props}
      destroyOnClose
      footer={null}
      className={`rq-modal ${props.className ?? ""}`}
    >
      {props.children}
    </Modal>
  );
};

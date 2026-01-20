import { Modal, ModalProps } from "antd";
import React from "react";
import "./RQModal.css";

/**
 *  Use "rq-modal-content" and "rq-modal-footer" class names for content/body and footer.
 */
export const RQModal: React.FC<ModalProps> = (props) => {
  return (
    <Modal {...props} destroyOnClose footer={props.footer ?? null} className={`rq-modal ${props.className ?? ""}`}>
      {props.children}
    </Modal>
  );
};

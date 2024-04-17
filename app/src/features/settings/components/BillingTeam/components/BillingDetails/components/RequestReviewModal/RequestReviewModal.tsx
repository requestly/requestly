import React from "react";
import { Modal, ModalProps } from "antd";
import "./RequestReviewModal.scss";

export const RequestReviewModal: React.FC<ModalProps> = ({ ...props }) => {
  return (
    <Modal {...props} wrapClassName="custom-rq-modal review-request-modal">
      {props.children}
    </Modal>
  );
};

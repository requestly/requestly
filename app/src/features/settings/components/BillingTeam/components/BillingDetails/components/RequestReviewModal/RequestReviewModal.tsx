import React, { ReactNode } from "react";
import { Modal, ModalProps, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./RequestReviewModal.scss";

interface RequestReviewModalProps extends ModalProps {
  isLoading: boolean;
  loadingText: string;
  result: ReactNode;
}

export const RequestReviewModal: React.FC<RequestReviewModalProps> = ({ isLoading, loadingText, result, ...props }) => {
  return (
    <Modal {...props} wrapClassName="custom-rq-modal review-request-modal">
      <div className="review-request-content-container">
        <div className="review-request-content">
          {isLoading && (
            <div className="review-request-loader-container">
              <Spin indicator={<LoadingOutlined spin className="review-request-loader" />} />
              <span className="review-request-loader-text">{loadingText}</span>
            </div>
          )}

          {result && <div className="review-request-result-text">{result}</div>}
        </div>
      </div>
    </Modal>
  );
};

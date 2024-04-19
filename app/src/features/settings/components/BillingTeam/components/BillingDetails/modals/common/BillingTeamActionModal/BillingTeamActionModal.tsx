import React, { ReactNode } from "react";
import { Modal, ModalProps, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./BillingTeamActionModal.scss";

interface BillingTeamActionModalProps extends ModalProps {
  isLoading: boolean;
  loadingText: string;
  result: ReactNode;
}

export const BillingTeamActionModal: React.FC<BillingTeamActionModalProps> = ({
  isLoading,
  loadingText,
  result,
  ...props
}) => {
  return (
    <Modal {...props} wrapClassName="custom-rq-modal billing-team-action-modal">
      <div className="billing-team-action-content-container">
        <div className="billing-team-action-content">
          {isLoading && (
            <div className="billing-team-action-loader-container">
              <Spin indicator={<LoadingOutlined spin className="billing-team-action-loader" />} />
              <span className="billing-team-action-loader-text">{loadingText}</span>
            </div>
          )}

          {result && <div className="billing-team-action-result-text">{result}</div>}
        </div>
      </div>
    </Modal>
  );
};

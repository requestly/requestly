import React from "react";
import { Space, Spin } from "antd";
import emptyResponseIcon from "../../../../../../../assets/empty-card.svg";
import "./emptyResponseView.scss";
import { CloseCircleFilled } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";

interface EmptyResponseViewProps {
  isLoading: boolean;
  isFailed: boolean;
  onCancelRequest: () => void;
  emptyDescription: string;
}
export const EmptyResponsePlaceholder: React.FC<EmptyResponseViewProps> = ({
  isLoading,
  isFailed,
  onCancelRequest,
  emptyDescription,
}) => {
  return (
    <>
      <div className="api-client-empty-response-view">
        {isLoading ? (
          <>
            <Spin size="large" tip="Request in progress..." />
            <RQButton onClick={onCancelRequest} className="mt-16">
              Cancel request
            </RQButton>
          </>
        ) : isFailed ? (
          <Space>
            <CloseCircleFilled style={{ color: "#ff4d4f" }} />
            Failed to send the request. Please check if the URL is valid.
          </Space>
        ) : (
          <>
            <img src={emptyResponseIcon} alt="empty card" />
            <div className="api-client-empty-response-view__title">Nothing to see here!</div>
            <div className="api-client-empty-response-view__description">{emptyDescription}</div>
          </>
        )}
      </div>
    </>
  );
};

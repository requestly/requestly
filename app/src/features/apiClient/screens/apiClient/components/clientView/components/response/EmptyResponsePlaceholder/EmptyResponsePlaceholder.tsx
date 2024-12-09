import React from "react";
import { Space } from "antd";
import emptyResponseIcon from "../../../../../../../assets/empty-card.svg";
import "./emptyResponsePlaceholder.scss";
import { CloseCircleFilled } from "@ant-design/icons";
import { RQAPI } from "features/apiClient/types";

interface EmptyResponseViewProps {
  isFailed: boolean;
  emptyDescription: string;
  error?: RQAPI.RequestErrorEntry["error"];
}
export const EmptyResponsePlaceholder: React.FC<EmptyResponseViewProps> = ({ isFailed, emptyDescription, error }) => {
  return (
    <>
      <div className="api-client-empty-response-view">
        {isFailed ? (
          <Space>
            <CloseCircleFilled style={{ color: "#ff4d4f" }} />
            {error
              ? `Error in evaluating ${error.source} - ${error.name}: ${error.message}`
              : "Failed to send the request. Please check if the URL is valid or check the console for error."}
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

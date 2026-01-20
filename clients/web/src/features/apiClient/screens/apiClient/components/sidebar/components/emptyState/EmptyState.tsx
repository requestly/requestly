import React, { useState } from "react";
import { RQAPI } from "features/apiClient/types";
import Link from "antd/lib/typography/Link";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { NewApiRecordDropdown, NewRecordDropdownItemType } from "../NewApiRecordDropdown/NewApiRecordDropdown";
import "./emptyState.scss";

export interface EmptyStateProps {
  disabled?: boolean;
  message: string;
  newRecordBtnText: string;
  onNewRecordClick?: (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => Promise<void>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, disabled = false, onNewRecordClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleNewRecordClick = (params: { recordType: RQAPI.RecordType; entryType?: RQAPI.ApiEntryType }) => {
    onNewRecordClick?.(params.recordType, params.entryType ?? RQAPI.ApiEntryType.HTTP)
      .catch((error) => {
        console.error("Error creating new API Client record", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="empty-state-container">
      <div className="empty-message">{message}</div>
      <div className="empty-state-actions">
        <NewApiRecordDropdown
          invalidActions={[NewRecordDropdownItemType.ENVIRONMENT, NewRecordDropdownItemType.COLLECTION]}
          disabled={disabled}
          onSelect={(params) => {
            setIsLoading(true);
            handleNewRecordClick(params);
          }}
          buttonProps={{
            size: "small",
            loading: isLoading,
          }}
        />
        <Link
          className="new-collection-link"
          onClick={() => handleNewRecordClick({ recordType: RQAPI.RecordType.COLLECTION })}
        >
          <MdAdd />
          <span>New collection</span>
        </Link>
      </div>
    </div>
  );
};

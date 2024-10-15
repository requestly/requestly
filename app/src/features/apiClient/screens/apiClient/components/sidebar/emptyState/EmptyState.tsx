import React from "react";
import emptyCardImage from "../../../../../assets/empty-card.svg";
import { RQButton } from "lib/design-system-v2/components";
import "./emptyState.scss";

interface Props {
  message: string;
  newRecordBtnText: string;
  onNewRecordClick: () => void;
}

export const EmptyState: React.FC<Props> = ({ message, newRecordBtnText, onNewRecordClick }) => {
  return (
    <div className="empty-state-container">
      <img className="empty-card-image" width={40} height={40} src={emptyCardImage} alt="Empty collection list" />
      <div className="empty-message">{message}</div>

      {onNewRecordClick ? (
        <RQButton size="small" className="new-record-btn" onClick={onNewRecordClick}>
          {newRecordBtnText}
        </RQButton>
      ) : null}
    </div>
  );
};

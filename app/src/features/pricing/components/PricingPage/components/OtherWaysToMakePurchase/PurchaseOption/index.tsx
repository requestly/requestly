import React from "react";
import { Button } from "antd";
import "./PurchaseOption.scss";

interface PurchaseOptionProps {
  title: string;
  description: string;
  action?: {
    text: string;
    handler: () => void;
  };
}

export const PurchaseOption: React.FC<PurchaseOptionProps> = ({ title = "", description = "", action }) => {
  return (
    <div className="purchase-option-container">
      <div className="purchase-option-details">
        <div className="purchase-option-title">{title}</div>
        <div className="purchase-option-description">{description}</div>
      </div>

      {action ? (
        <Button
          className="purchase-option-action-btn"
          onClick={() => {
            action?.handler?.();
          }}
        >
          {action?.text}
        </Button>
      ) : null}
    </div>
  );
};

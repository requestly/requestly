import React, { useRef } from "react";
import { InputNumber, Select } from "antd";

interface PlanQuantitySelectorProps {
  quantity: number;
  isNewCheckoutFlowEnabled: boolean;
  handleQuantityChange: (value: number) => void;
}

export const PlanQuantitySelector: React.FC<PlanQuantitySelectorProps> = ({
  quantity,
  isNewCheckoutFlowEnabled,
  handleQuantityChange,
}) => {
  const options = useRef([
    {
      label: "1 member",
      value: 1,
    },
    {
      label: "3 members",
      value: 3,
    },
    {
      label: "5 members",
      value: 5,
    },
    {
      label: "10 members",
      value: 10,
    },
    {
      label: "15 members",
      value: 15,
    },
    {
      label: "20 members",
      value: 20,
    },
    {
      label: "More than 20 members",
      value: Infinity,
    },
  ]);

  if (isNewCheckoutFlowEnabled) {
    return (
      <Select
        className="pricing-plan-quantity-selector__select"
        options={options.current}
        defaultValue={quantity}
        onChange={(value) => handleQuantityChange(value)}
      />
    );
  }

  return (
    <div className="quantity-selector">
      <InputNumber
        style={{ width: "104px", height: "32px", display: "flex", alignItems: "center" }}
        size="small"
        type="number"
        min={1}
        max={1000}
        maxLength={4}
        defaultValue={1}
        value={quantity}
        onChange={(value) => {
          handleQuantityChange(value);
        }}
      />
      <div className="members">Members</div>
    </div>
  );
};

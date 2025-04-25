import React, { useMemo, useEffect } from "react";
import { InputNumber, Select } from "antd";
import { PRICING } from "features/pricing/constants/pricing";

interface PlanQuantityOption {
  label: string;
  value: number;
}

interface PlanQuantitySelectorProps {
  currentSeats: number;
  columnPlanName: string;
  currentPlanName: string;
  quantity: number;
  isNewCheckoutFlowEnabled: boolean;
  handleQuantityChange: (value: number) => void;
}

const DEFAULT_QUANTITY_OPTIONS: PlanQuantityOption[] = [
  { label: "1 member", value: 1 },
  { label: "3 members", value: 3 },
  { label: "5 members", value: 5 },
  { label: "10 members", value: 10 },
  { label: "15 members", value: 15 },
  { label: "20 members", value: 20 },
  { label: "More than 20 members", value: Infinity },
];

const QuantityInput: React.FC<{
  minQuantity: number;
  handleQuantityChange: (value: number) => void;
}> = ({ minQuantity, handleQuantityChange }) => (
  <div className="quantity-selector">
    <InputNumber
      style={{ width: "104px", height: "32px", display: "flex", alignItems: "center" }}
      size="small"
      type="number"
      min={minQuantity}
      max={1000}
      maxLength={4}
      defaultValue={minQuantity}
      onChange={handleQuantityChange}
    />
    <div className="members">Members</div>
  </div>
);

const QuantitySelect: React.FC<{
  options: PlanQuantityOption[];
  handleQuantityChange: (value: number) => void;
}> = ({ options, handleQuantityChange }) => (
  <Select
    className="pricing-plan-quantity-selector__select"
    options={options}
    defaultValue={options[0].value}
    onChange={handleQuantityChange}
  />
);

export const PlanQuantitySelector: React.FC<PlanQuantitySelectorProps> = ({
  currentSeats,
  currentPlanName,
  columnPlanName,
  isNewCheckoutFlowEnabled,
  handleQuantityChange,
}) => {
  const minQuantity = useMemo(() => {
    if (
      currentPlanName === columnPlanName &&
      columnPlanName !== PRICING.PLAN_NAMES.FREE &&
      columnPlanName !== PRICING.PLAN_NAMES.LITE
    ) {
      return currentSeats + 1;
    }
    return currentSeats ?? 1;
  }, [currentPlanName, columnPlanName, currentSeats]);

  const filteredOptions = useMemo(() => {
    if (!currentPlanName) return DEFAULT_QUANTITY_OPTIONS;
    return DEFAULT_QUANTITY_OPTIONS.filter((option) => {
      if (option.value === Infinity) return true;
      if (columnPlanName === currentPlanName) return option.value > currentSeats;
      return option.value >= currentSeats;
    });
  }, [currentSeats, currentPlanName, columnPlanName]);

  useEffect(() => {
    if (!currentPlanName) return;
    if (isNewCheckoutFlowEnabled) {
      const ceilValue = filteredOptions.find((option) => option.value >= minQuantity);
      handleQuantityChange(ceilValue?.value ?? minQuantity);
    } else {
      handleQuantityChange(minQuantity);
    }
  }, [currentPlanName, handleQuantityChange, minQuantity, isNewCheckoutFlowEnabled, filteredOptions]);

  if (currentPlanName === PRICING.PLAN_NAMES.PROFESSIONAL && columnPlanName === PRICING.PLAN_NAMES.BASIC) return null;
  if (isNewCheckoutFlowEnabled) {
    return <QuantitySelect options={filteredOptions} handleQuantityChange={handleQuantityChange} />;
  }

  return <QuantityInput minQuantity={minQuantity} handleQuantityChange={handleQuantityChange} />;
};

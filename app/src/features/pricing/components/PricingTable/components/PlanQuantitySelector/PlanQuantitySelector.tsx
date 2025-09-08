import React, { useMemo, useEffect, useCallback } from "react";
import { InputNumber, Select } from "antd";
import { PRICING } from "features/pricing/constants/pricing";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { isPremiumUser } from "utils/PremiumUtils";

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
  handleQuantityChange: (value: number, skipNotification?: boolean) => void;
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
  value: number;
  handleQuantityChange: (value: number) => void;
}> = ({ minQuantity, value, handleQuantityChange }) => (
  <div className="quantity-selector">
    <InputNumber
      style={{ width: "104px", height: "32px", display: "flex", alignItems: "center" }}
      size="small"
      type="number"
      min={minQuantity}
      max={1000}
      maxLength={4}
      value={value}
      onChange={(val) => handleQuantityChange(val)}
    />
    <div className="members">Members</div>
  </div>
);

const QuantitySelect: React.FC<{
  options: PlanQuantityOption[];
  value: number;
  handleQuantityChange: (value: number, skipNotification?: boolean) => void;
}> = ({ options, value, handleQuantityChange }) => (
  <Select
    className="pricing-plan-quantity-selector__select"
    options={options}
    value={value}
    onChange={(val) => handleQuantityChange(val)}
  />
);

export const PlanQuantitySelector: React.FC<PlanQuantitySelectorProps> = ({
  currentSeats,
  currentPlanName,
  columnPlanName,
  quantity,
  isNewCheckoutFlowEnabled,
  handleQuantityChange,
}) => {
  const user = useSelector(getUserAuthDetails);
  const isUserTrialing = user?.details?.planDetails?.status === "trialing";

  const isNonPremiumOrTrialing = useMemo(() => {
    return isUserTrialing || !isPremiumUser(user?.details?.planDetails);
  }, [user?.details?.planDetails, isUserTrialing]);

  const isUpgradingSamePlan =
    currentPlanName === columnPlanName &&
    columnPlanName !== PRICING.PLAN_NAMES.FREE &&
    columnPlanName !== PRICING.PLAN_NAMES.LITE;

  const minQuantity = useMemo(() => {
    if (isNonPremiumOrTrialing) {
      return 1;
    }

    if (isUpgradingSamePlan) {
      return currentSeats + 1;
    }

    return currentSeats;
  }, [isNonPremiumOrTrialing, isUpgradingSamePlan, currentSeats]);

  const filteredOptions = useMemo(() => {
    if (!currentPlanName || isNonPremiumOrTrialing) return DEFAULT_QUANTITY_OPTIONS;
    return DEFAULT_QUANTITY_OPTIONS.filter((option) => {
      if (option.value === Infinity) return true;
      if (columnPlanName === currentPlanName) return option.value > minQuantity;
      return option.value >= minQuantity;
    });
  }, [minQuantity, currentPlanName, columnPlanName, isNonPremiumOrTrialing]);

  const handleInitialQuantity = useCallback(() => {
    if (!currentPlanName) return;

    const newQuantity = isNewCheckoutFlowEnabled
      ? filteredOptions.find((option) => option.value >= minQuantity)?.value ?? minQuantity
      : minQuantity;

    handleQuantityChange(newQuantity, true);
  }, [currentPlanName, isNewCheckoutFlowEnabled, filteredOptions, minQuantity, handleQuantityChange]);

  useEffect(() => {
    handleInitialQuantity();
  }, [handleInitialQuantity]);

  if (
    !isUserTrialing &&
    currentPlanName === PRICING.PLAN_NAMES.PROFESSIONAL &&
    columnPlanName === PRICING.PLAN_NAMES.BASIC
  )
    return null;
  if (isNewCheckoutFlowEnabled) {
    return <QuantitySelect options={filteredOptions} value={quantity} handleQuantityChange={handleQuantityChange} />;
  }

  return (
    <QuantityInput
      minQuantity={minQuantity}
      value={quantity ?? minQuantity}
      handleQuantityChange={handleQuantityChange}
    />
  );
};

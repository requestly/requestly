import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import APP_CONSTANTS from "../../../../../../../../config/constants";
import CancelPlanModal from "./CancelPlanModal";
import { globalActions } from "store/slices/global/slice";
import { trackViewPricingPlansClicked } from "modules/analytics/events/common/pricing";

// DEAD CODE
const SubscriptionActionButtons = ({ isSubscriptionActive = false }) => {
  const dispatch = useDispatch();
  const [isCancelPlanModalActive, setIsCancelPlanModalActive] = useState(false);

  const handleCancelPlanModalClose = () => {
    setIsCancelPlanModalActive(false);
  };

  return (
    <div>
      {isSubscriptionActive ? (
        <Button danger className="billing-cancel-plan-btn" onClick={() => setIsCancelPlanModalActive(true)}>
          Cancel plan
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => {
            dispatch(
              globalActions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { selectedPlan: null, source: "workspace_upgrade" },
              })
            );
            trackViewPricingPlansClicked("workspace_upgrade");
          }}
        >
          Upgrade
        </Button>
      )}

      <Button
        target="_blank"
        rel="noreferrer"
        className="billing-learn-more-btn"
        href={APP_CONSTANTS.PATHS.PRICING.ABSOLUTE}
      >
        Learn more
      </Button>

      {isCancelPlanModalActive ? (
        <CancelPlanModal isOpen={isCancelPlanModalActive} handleToggleModal={handleCancelPlanModalClose} />
      ) : null}
    </div>
  );
};

export default SubscriptionActionButtons;

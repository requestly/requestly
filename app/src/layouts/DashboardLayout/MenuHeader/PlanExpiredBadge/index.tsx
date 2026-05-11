import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { Badge } from "antd";
import { trackRenewNowClicked } from "modules/analytics/events/misc/monetizationExperiment";
import "./index.scss";
import { getPrettyPlanName } from "utils/FormattingHelper";

export const PlanExpiredBadge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const handleBadgeClick = () => {
    trackRenewNowClicked("header");
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "pricingModal",
        newValue: true,
        newProps: { selectedPlan: null, source: "header_renew_button" },
      })
    );
  };

  return (
    <div className="header-plan-expired-badge-container">
      <div
        className="header-plan-expired-badge"
        role="button"
        tabIndex={0}
        aria-label="Renew expired plan"
        onClick={handleBadgeClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBadgeClick();
          }
        }}
      >
        <span>
          <Badge status="error" />
        </span>
        <span>{getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planId))} plan expired</span>
      </div>
      {/* TEMPORARILY HIDDEN AS HEADER IS OVERPOPULATED WITH MANY BUTTONS  */}
      {/* <RQButton
        type="primary"
        onClick={() => {
          trackRenewNowClicked("header");
          dispatch(
            actions.toggleActiveModal({
              modalName: "pricingModal",
              newValue: true,
              newProps: { selectedPlan: null, source: "header_renew_button" },
            })
          );
        }}
      >
        Renew now
      </RQButton> */}
    </div>
  );
};

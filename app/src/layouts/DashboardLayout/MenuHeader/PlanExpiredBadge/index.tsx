import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { capitalize } from "lodash";
import { Badge } from "antd";
import { trackRenewNowClicked } from "modules/analytics/events/misc/monetizationExperiment";
import "./index.scss";

export const PlanExpiredBadge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  return (
    <div className="header-plan-expired-badge-container">
      <div className="header-plan-expired-badge">
        <span>
          <Badge status="error" />
        </span>
        <span>{capitalize(getPlanNameFromId(user?.details?.planDetails?.planId))} plan expired</span>
      </div>
      <RQButton
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
      </RQButton>
    </div>
  );
};

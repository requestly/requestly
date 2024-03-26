import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Result, Spin } from "antd";
import { getIsBillingTeamsLoading } from "store/features/billing/selectors";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import { SOURCE } from "modules/analytics/events/common/constants";
import { toast } from "utils/Toast";
import { BillingList } from "./components/BillingList";

export const BillingTeam: React.FC = () => {
  const [queryParams] = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isBillingTeamsLoading = useSelector(getIsBillingTeamsLoading);
  const joiningRequestAction = queryParams.get("joinRequestAction");

  useEffect(() => {
    if (!user.loggedIn) {
      toast.warn(
        joiningRequestAction
          ? `You need to login to review this joining request`
          : `You need to login to view this billing team`
      );
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            eventSource: SOURCE.BILLING_TEAM,
          },
        })
      );
    }
  }, [user.loggedIn, joiningRequestAction, dispatch]);

  if (!user.loggedIn) {
    return (
      <Result
        icon={null}
        status="error"
        title={
          joiningRequestAction
            ? `You need to login to review this joining request`
            : "You need to login to view this billing team"
        }
        extra={
          <RQButton
            type="primary"
            onClick={() => {
              dispatch(
                actions.toggleActiveModal({
                  modalName: "authModal",
                  newValue: true,
                  newProps: {
                    authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
                    eventSource: SOURCE.BILLING_TEAM,
                  },
                })
              );
            }}
          >
            Login
          </RQButton>
        }
      />
    );
  }

  if (isBillingTeamsLoading)
    return (
      <div className="billing-team-loader-screen">
        <Spin size="large" />
        <div className="header">Getting your billing team ...</div>
      </div>
    );

  return <BillingList />;
};

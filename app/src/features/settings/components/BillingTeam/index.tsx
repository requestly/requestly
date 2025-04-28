import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useSearchParams } from "react-router-dom";
import { Result, Spin } from "antd";
import { getAvailableBillingTeams, getIsBillingTeamsLoading } from "store/features/billing/selectors";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { SOURCE } from "modules/analytics/events/common/constants";
import { toast } from "utils/Toast";
import { BillingTeamsSidebar } from "./components/BillingTeamsSidebar";
import { SettingsSecondarySidebar } from "../SettingsSecondarySidebar";
import "./index.scss";

export const BillingTeamContainer: React.FC = () => {
  const [queryParams] = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const isBillingTeamsLoading = useSelector(getIsBillingTeamsLoading);
  const joinRequestAction = queryParams.get("joinRequestAction");

  const isBillingTeamSidebarVisible = useMemo(() => {
    if (
      billingTeams.length > 1 ||
      (billingTeams.length === 1 && billingTeams.some((team) => !(user?.details?.profile?.uid in team.members)))
    ) {
      return true;
    }
    return false;
  }, [billingTeams, user?.details?.profile?.uid]);

  useEffect(() => {
    if (!user.loggedIn) {
      toast.warn(
        joinRequestAction
          ? `You need to sign in to review this joining request`
          : `You need to sign in to view this billing team`
      );
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            eventSource: SOURCE.BILLING_TEAM,
          },
        })
      );
    }
  }, [user.loggedIn, joinRequestAction, dispatch]);

  const renderBillingTeamContent = useCallback(() => {
    if (!user.loggedIn) {
      return (
        <Result
          icon={null}
          status="error"
          title={
            joinRequestAction
              ? `You need to sign in to review this joining request`
              : "You need to sign in to view this billing team"
          }
          extra={
            <RQButton
              type="primary"
              onClick={() => {
                dispatch(
                  globalActions.toggleActiveModal({
                    modalName: "authModal",
                    newValue: true,
                    newProps: {
                      authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                      eventSource: SOURCE.BILLING_TEAM,
                    },
                  })
                );
              }}
            >
              Sign in
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
  }, [user.loggedIn, joinRequestAction, dispatch, isBillingTeamsLoading]);

  return (
    <div className="billing-team-container">
      <div>
        {isBillingTeamSidebarVisible && (
          <SettingsSecondarySidebar>
            <BillingTeamsSidebar billingTeams={billingTeams} />
          </SettingsSecondarySidebar>
        )}
      </div>
      <div className="billing-team-content-wrapper">
        {renderBillingTeamContent()}
        <Outlet />
      </div>
    </div>
  );
};

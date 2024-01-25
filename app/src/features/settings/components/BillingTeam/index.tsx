import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Result, Spin } from "antd";
import { MyBillingTeam } from "./components/MyBillingTeam";
import { getAvailableBillingTeams, getIsBillingTeamsLoading } from "store/features/billing/selectors";
import APP_CONSTANTS from "config/constants";

export const BillingTeam: React.FC = () => {
  const { billingId } = useParams();
  const isBillingTeamsLoading = useSelector(getIsBillingTeamsLoading);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const location = useLocation();
  const hasAccessToBillingTeam = useMemo(
    () =>
      billingTeams?.some((billingTeam) => {
        return billingTeam?.id === billingId && location.pathname !== APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE;
      }),
    [billingTeams, billingId, location.pathname]
  );

  if (isBillingTeamsLoading || !billingId)
    return (
      <div className="billing-team-loader-screen">
        <Spin size="large" />
        <div className="header">Getting your billing team ...</div>
      </div>
    );

  if (!hasAccessToBillingTeam) {
    return (
      <div className="display-row-center items-center" style={{ marginTop: "80px" }}>
        <Result
          status="error"
          title="Oops, something went wrong!"
          subTitle="You are not a part of this billing team or this  team does not exist"
        />
      </div>
    );
  }

  return <MyBillingTeam />;
  /*
  ADD OTHER BILLING TEAM COMPONENTS HERE
  ADD NO BILLING TEAM COMPONENT HERE
  */
};

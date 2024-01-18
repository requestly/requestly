import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Result } from "antd";
import { MyBillingTeam } from "./components/MyBillingTeam";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import APP_CONSTANTS from "config/constants";

export const BillingTeam: React.FC = () => {
  const { billingId } = useParams();
  const billingTeams = useSelector(getAvailableBillingTeams);
  const location = useLocation();

  if (
    !billingTeams.find(
      (billingTeam) =>
        billingTeam.id === billingId && location.pathname !== APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE
    )
  )
    return (
      <div className="display-row-center items-center" style={{ marginTop: "80px" }}>
        <Result
          status="error"
          title="Oops, something went wrong!"
          subTitle="You are not a part of this billing team or this  team does not exist"
        />
      </div>
    );

  return <MyBillingTeam />;
  /*
  ADD OTHER BILLING TEAM COMPONENTS HERE
  ADD NO BILLING TEAM COMPONENT HERE
  */
};

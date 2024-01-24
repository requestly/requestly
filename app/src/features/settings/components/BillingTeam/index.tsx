import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Result, Spin } from "antd";
import { MyBillingTeam } from "./components/MyBillingTeam";
import {
  getAvailableBillingTeams,
  getBillingTeamMemberById,
  getIsBillingTeamsLoading,
} from "store/features/billing/selectors";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";
import { OtherBillingTeam } from "./components/OtherBillingTeam";
import { UserPlanDetails } from "./components/UserPlanDetails";

export const BillingTeam: React.FC = () => {
  // TODO: REFACTOR
  const { billingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const isBillingTeamsLoading = useSelector(getIsBillingTeamsLoading);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const isTeamMember = useSelector(getBillingTeamMemberById(billingId, user?.details?.profile?.uid));

  const [showUserPlanDetails, setShowUserPlanDetails] = useState(false);

  const hasAccessToBillingTeam = useMemo(
    () =>
      billingTeams.some((billingTeam) => {
        return billingTeam.id === billingId && location.pathname !== APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE;
      }),
    [billingTeams, billingId, location.pathname]
  );

  useEffect(() => {
    setShowUserPlanDetails(false);
    if (location.pathname === APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE) {
      if (billingTeams.length) {
        // if (billingTeams.length === 1)
        //   navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${billingTeams[0]?.id}`);
        // else {
        // navigate to the billing team in which the user is a member
        const team = billingTeams.find((team) => {
          return user?.details?.profile?.uid in team.members;
        });
        if (team?.id) navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${team.id}`);
        else {
          setShowUserPlanDetails(true);
          navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
        }
        // }
      } else {
        setShowUserPlanDetails(true);
        navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
      }
    }
  }, [location.pathname, billingTeams, navigate, user?.details?.profile?.uid]);

  if ((isBillingTeamsLoading || !billingId) && !showUserPlanDetails)
    return (
      <div className="billing-team-loader-screen">
        <Spin size="large" />
        <div className="header">Getting your billing team ...</div>
      </div>
    );

  if (!hasAccessToBillingTeam && billingId) {
    return (
      <div className="display-row-center items-center" style={{ marginTop: "80px" }}>
        <Result
          status="error"
          title="Oops, something went wrong!"
          subTitle="You are not a part of this billing team or this team does not exist"
        />
      </div>
    );
  }

  if (showUserPlanDetails) return <UserPlanDetails />;

  if (isTeamMember) return <MyBillingTeam />;
  else return <OtherBillingTeam />;
};

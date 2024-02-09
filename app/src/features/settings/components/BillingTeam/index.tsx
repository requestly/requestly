import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { billingActions } from "store/features/billing/slice";

export const BillingTeam: React.FC = () => {
  const { billingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const isBillingTeamsLoading = useSelector(getIsBillingTeamsLoading);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const userDetailsOfSelectedBillingTeam = useSelector(
    getBillingTeamMemberById(billingId, user?.details?.profile?.uid)
  );
  const [isTeamMember, setIsTeamMember] = useState(false);

  const [showUserPlanDetails, setShowUserPlanDetails] = useState(false);

  const hasAccessToBillingTeam = useMemo(
    () =>
      billingTeams?.some((billingTeam) => {
        return billingTeam?.id === billingId && location.pathname !== APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE;
      }),
    [billingTeams, billingId, location.pathname]
  );

  useEffect(() => {
    if (!hasAccessToBillingTeam && billingId) {
      const getTeamOtherTeam = httpsCallable(getFunctions(), "billing-fetchBillingTeam");
      getTeamOtherTeam({ billingId })
        .then((result: any) => {
          if (result.data.success) {
            const newTeams = [...billingTeams, result.data.billingTeamData];
            dispatch(billingActions.setAvailableBillingTeams(newTeams));
            dispatch(
              billingActions.setBillingTeamMembers({ billingId, billingTeamMembers: result.data.billingTeamMembers })
            );
            setIsTeamMember(true);
          }
        })
        .catch((error) => {
          Logger.log(error);
        });
    }
  }, [billingId, hasAccessToBillingTeam, dispatch, billingTeams]);

  useEffect(() => {
    setShowUserPlanDetails(false);
    if (location.pathname === APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE) {
      if (billingTeams.length) {
        // navigate to the billing team in which the user is a member
        const team = billingTeams.find((team) => {
          return user?.details?.profile?.uid in team.members;
        });
        if (team?.id) navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${team.id}`);
        else {
          // Show user plan details if the user is not a member of any billing team
          setShowUserPlanDetails(true);
          navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE);
        }
      } else {
        // Show user plan details if the user is not a member of any billing team
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

  if (isTeamMember || userDetailsOfSelectedBillingTeam) return <MyBillingTeam />;
  else return <OtherBillingTeam />;
};

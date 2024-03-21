import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { PRICING } from "features/pricing";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import { SOURCE } from "modules/analytics/events/common/constants";
import { toast } from "utils/Toast";
import { BillingTeamJoinRequestAction } from "./types";
import { trackJoinBillingTeamRequestToastViewed } from "features/settings/analytics";

export const BillingTeam: React.FC = () => {
  const { billingId } = useParams();
  const [queryParams] = useSearchParams();
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

  const joiningRequestAction = queryParams.get("joinRequestAction");
  const userId = queryParams.get("user");

  const showReviewResultToast = useCallback((message: string, type: string, duration = 5) => {
    switch (type) {
      case "success":
        toast.success(message, duration);
        break;
      case "warning":
        toast.warn(message, duration);
        break;
      case "error":
        toast.error(message, duration);
        break;
      default:
        toast.info(message, duration);
    }
  }, []);

  useEffect(() => {
    if (!hasAccessToBillingTeam && billingId) {
      const getOtherTeam = httpsCallable(getFunctions(), "billing-fetchBillingTeam");
      getOtherTeam({ billingId })
        .then((result: any) => {
          if (result.data.success) {
            const newTeams = [...billingTeams, result.data.billingTeamData];
            dispatch(billingActions.setAvailableBillingTeams(newTeams));
            const formattedBillingTeamMembers = result.data.billingTeamMembers?.reduce(
              (acc: { [id: string]: any }, curr: { [id: string]: any }) => {
                acc[curr.id] = curr;
                return acc;
              },
              {}
            );
            dispatch(
              billingActions.setBillingTeamMembers({ billingId, billingTeamMembers: formattedBillingTeamMembers })
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
        if (team?.id && user?.details?.planDetails?.type === PRICING.CHECKOUT.MODES.TEAM)
          navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${team.id}`);
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
  }, [location.pathname, billingTeams, navigate, user?.details?.profile?.uid, user?.details?.planDetails?.type]);

  useEffect(() => {
    if (billingId && joiningRequestAction && userId) {
      toast.loading(
        `${
          joiningRequestAction === BillingTeamJoinRequestAction.ACCEPT ? "Approving" : "Declining"
        } the joining request ...`,
        5
      );
      trackJoinBillingTeamRequestToastViewed(joiningRequestAction, "loading");
      const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
      reviewBillingTeamJoiningRequest({
        billingTeamId: billingId,
        action: joiningRequestAction,
        userId,
      })
        .then((res: any) => {
          showReviewResultToast(res.data.message, res.data.result.status);
          trackJoinBillingTeamRequestToastViewed(joiningRequestAction, res.data.result.status);
          Logger.log("Billing team joining request reviewed");
        })
        .catch((err: any) => {
          toast.error(err.message, 5);
          trackJoinBillingTeamRequestToastViewed(joiningRequestAction, "error");
          Logger.log("Error while reviewing billing team joining request");
        });
    }
  }, [billingId, joiningRequestAction, userId, showReviewResultToast]);

  if (!user.loggedIn) {
    return (
      <Result
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

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Result } from "antd";
import PageLoader from "components/misc/PageLoader";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getBillingTeamRedirectURL } from "backend/billing";
import PATHS from "config/constants/sub/paths";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPrettyPlanName } from "utils/FormattingHelper";
import Logger from "lib/logger";

export const UpgradeSuccess: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const userPlanName = user?.details?.planDetails?.planName;

  useEffect(() => {
    if (user.loggedIn && userPlanName) {
      const sendPlanUpgradedNotification = httpsCallable(
        getFunctions(),
        "premiumNotifications-sendPlanUpgradedNotification"
      );
      sendPlanUpgradedNotification({
        planName: getPrettyPlanName(userPlanName),
      }).catch((e) => {
        Logger.error(e);
      });

      getBillingTeamRedirectURL(user?.details?.profile?.uid).then((redirectUrl) => {
        if (!redirectUrl) {
          navigate(PATHS.SETTINGS.BILLING.RELATIVE);
        } else {
          navigate(redirectUrl);
        }
      });
    }
  }, [navigate, user?.details?.profile?.uid, user.loggedIn, userPlanName]);

  return (
    <Card>
      <Result
        status="success"
        title="Successfully upgraded your plan!"
        subTitle="Account activation takes 1-2 minutes, please wait."
        extra={[<PageLoader message="" />]}
      />
    </Card>
  );
};

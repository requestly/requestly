import React, { useEffect, useState } from "react";
import ProCard from "@ant-design/pro-card";
// UTILS
import { getUserAuthDetails } from "../../../../../store/selectors";
// SUB COMPONENTS
import GetASubscription from "./GetASubscription";
import SubscriptionInfo from "./SubscriptionInfo";
import { useSelector } from "react-redux";
import { getAttrFromFirebase } from "utils/AnalyticsUtils";

const ActiveLicenseInfo = ({
  hideShadow,
  customHeading,
  hideManagePersonalSubscriptionButton,
  hideIfSubscriptionIsPersonal,
  hideIfNoSubscription,
}) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const [isSessionReplayLifetimeActive, setIsSessionReplayLifetimeActive] = useState(false);

  const { type, status, planName, subscription } = user.details?.planDetails ?? {};
  const { startDate: validFrom, endDate: validTill } = subscription ?? {};
  const doesSubscriptionExist = !!type && !!status && !!planName;

  useEffect(() => {
    getAttrFromFirebase("session_replay_lifetime_pro")
      .then((val) => {
        if (val) {
          setIsSessionReplayLifetimeActive(true);
        }
      })
      .catch(() => {
        // do nothing
      });
  });

  const renderSubscriptionInfo = () => {
    return (
      <SubscriptionInfo
        hideShadow={hideShadow}
        hideManagePersonalSubscriptionButton={hideManagePersonalSubscriptionButton}
        subscriptionDetails={{
          validFrom,
          validTill,
          status,
          type,
          planName,
        }}
      />
    );
  };

  const renderGetASubscription = () => {
    return <GetASubscription hideShadow={hideShadow} />;
  };

  if (
    (hideIfSubscriptionIsPersonal && user.details?.planDetails?.type === "individual") ||
    (hideIfNoSubscription && !doesSubscriptionExist)
  ) {
    return <React.Fragment></React.Fragment>;
  }

  const renderSessionReplayProSubscription = () => {
    if (isSessionReplayLifetimeActive) {
      return (
        <>
          <SubscriptionInfo
            hideShadow={hideShadow}
            subscriptionDetails={{
              validFrom: new Date("2023-08-16T00:00:00Z").getTime(),
              validTill: new Date("2099-08-16T00:00:00Z").getTime(),
              status: "active",
              type: "producthunt",
              planName: "Session Replay Pro",
            }}
          />
          <br />
        </>
      );
    }

    return null;
  };

  return (
    <ProCard title={<h3 style={{ marginBottom: "0" }}>{customHeading}</h3>} className="primary-card github-like-border">
      {renderSessionReplayProSubscription()}
      {doesSubscriptionExist ? renderSubscriptionInfo() : renderGetASubscription()}
    </ProCard>
  );
};

export default ActiveLicenseInfo;

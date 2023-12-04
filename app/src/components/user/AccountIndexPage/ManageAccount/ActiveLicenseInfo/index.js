import React, { useEffect, useState } from "react";
import ProCard from "@ant-design/pro-card";
// UTILS
import { getUserAuthDetails } from "../../../../../store/selectors";
// SUB COMPONENTS
import GetASubscription from "./GetASubscription";
import SubscriptionInfo from "./SubscriptionInfo";
import { useSelector } from "react-redux";
import { getAttrFromFirebase } from "utils/AnalyticsUtils";
import { Row, Space } from "antd";
import ManageSubscription from "./ManageSubscription/ManageSubscription";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../../../../../firebase";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import Logger from "lib/logger";

const db = getFirestore(firebaseApp);

const ActiveLicenseInfo = ({
  hideShadow,
  customHeading,
  hideManagePersonalSubscriptionButton,
  hideIfSubscriptionIsPersonal,
  hideIfNoSubscription,
}) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace)?.id;

  const [isSessionReplayLifetimeActive, setIsSessionReplayLifetimeActive] = useState(false);
  const [sessionReplayLifeTimeDetails, setSessionReplayLifeTimeDetails] = useState({});

  const { type, status, planName, subscription } = user.details?.planDetails ?? {};
  const { startDate: validFrom, endDate: validTill } = subscription ?? {};
  const doesSubscriptionExist = !!type && !!status && !!planName;

  useEffect(() => {
    if (teamId) {
      const teamsRef = doc(db, "teams", teamId);
      getDoc(teamsRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.appsumo) {
              setIsSessionReplayLifetimeActive(true);
              setSessionReplayLifeTimeDetails({ ...data.appsumo, type: "appsumo-team" });
            }
          }
        })
        .catch(() => {
          Logger.log("Error while fetching appsumo details for team");
        });
    } else {
      getAttrFromFirebase("session_replay_lifetime_pro")
        .then((val) => {
          if (val) {
            setIsSessionReplayLifetimeActive(true);
            setSessionReplayLifeTimeDetails(val);
          }
        })
        .catch(() => {
          Logger.log("Error while fetching appsumo details for individual");
        });
    }
  }, [teamId]);

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
              validFrom:
                typeof sessionReplayLifeTimeDetails === "string"
                  ? new Date(sessionReplayLifeTimeDetails).getTime()
                  : new Date(sessionReplayLifeTimeDetails.date).getTime(),
              validTill: new Date("2099-08-16T00:00:00Z").getTime(),
              status: "active",
              type: sessionReplayLifeTimeDetails.type ?? "producthunt",
              planName: "SessionBook Plus",
            }}
          />
          <br />
        </>
      );
    }

    return null;
  };

  return (
    <ProCard
      title={
        <Row>
          <Space>
            <h3 style={{ marginBottom: "0" }}>{customHeading}</h3>
            {doesSubscriptionExist ? <ManageSubscription /> : null}
          </Space>
        </Row>
      }
      className="primary-card github-like-border"
    >
      {renderSessionReplayProSubscription()}
      {doesSubscriptionExist ? renderSubscriptionInfo() : renderGetASubscription()}
    </ProCard>
  );
};

export default ActiveLicenseInfo;

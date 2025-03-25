import React, { useCallback, useEffect, useState } from "react";
import ProCard from "@ant-design/pro-card";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import GetASubscription from "./GetASubscription";
import SubscriptionInfo from "./SubscriptionInfo";
import { useSelector } from "react-redux";
import { getAttrFromFirebase } from "utils/AnalyticsUtils";
import { Row, Space } from "antd";
import ManageSubscription from "./ManageSubscription/ManageSubscription";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../../../../../firebase";
import Logger from "lib/logger";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

const ActiveLicenseInfo = ({
  hideShadow,
  customHeading,
  hideManagePersonalSubscriptionButton,
  hideIfSubscriptionIsPersonal,
  hideIfNoSubscription,
}) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [isSessionReplayLifetimeActive, setIsSessionReplayLifetimeActive] = useState(false);
  const [lifeTimeSubscriptionDetails, setLifeTimeSubscriptionDetails] = useState({});

  const { type, status, planName, subscription } = user.details?.planDetails ?? {};
  const { startDate: validFrom, endDate: validTill } = subscription ?? {};
  const doesSubscriptionExist = (type === "appsumo" ? isSessionReplayLifetimeActive : !!type) && !!status && !!planName;

  const getSubscriptionEndDateForAppsumo = useCallback((date = new Date()) => {
    const currentDate = date;

    const endDate = new Date(currentDate);
    endDate.setFullYear(currentDate.getFullYear() + 5);

    return endDate.getTime();
  }, []);

  useEffect(() => {
    if (activeWorkspaceId) {
      const db = getFirestore(firebaseApp);
      const teamsRef = doc(db, "teams", activeWorkspaceId);
      getDoc(teamsRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.appsumo) {
              setIsSessionReplayLifetimeActive(true);
              setLifeTimeSubscriptionDetails({
                ...data.appsumo,
                startDate: data.appsumo.date,
                endDate: getSubscriptionEndDateForAppsumo(new Date(data.appsumo.date)),
                type: "appsumo",
              });
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
            setLifeTimeSubscriptionDetails(val);
          }
        })
        .catch(() => {
          Logger.log("Error while fetching appsumo details for individual");
        });
    }
  }, [activeWorkspaceId, getSubscriptionEndDateForAppsumo]);

  const renderSubscriptionInfo = () => {
    if (isSessionReplayLifetimeActive && status === "trialing") return <></>;
    return (
      <SubscriptionInfo
        hideShadow={hideShadow}
        isLifeTimeActive={type === "appsumo"}
        appSumoCodeCount={lifeTimeSubscriptionDetails?.codes?.length ?? 0}
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
            appSumoCodeCount={lifeTimeSubscriptionDetails?.codes?.length ?? 0}
            isLifeTimeActive={isSessionReplayLifetimeActive}
            subscriptionDetails={{
              validFrom:
                typeof lifeTimeSubscriptionDetails === "string"
                  ? new Date(lifeTimeSubscriptionDetails).getTime()
                  : lifeTimeSubscriptionDetails.startDate,
              validTill: lifeTimeSubscriptionDetails.endDate,
              status: "active",
              type: lifeTimeSubscriptionDetails.type ?? "producthunt",
              planName: "Session Book Plus",
              planId: "session_book_plus",
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

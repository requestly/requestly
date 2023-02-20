import React, { useEffect, useRef, useState, useCallback } from "react";
import { Row } from "reactstrap";
import ProCard from "@ant-design/pro-card";
// Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
// Sub Components
import SpinnerColumn from "../../../../../misc/SpinnerColumn";
import GetASubscription from "../../ActiveLicenseInfo/GetASubscription";
import SubscriptionInfo from "../../ActiveLicenseInfo/SubscriptionInfo";
import { getPlanNameFromId } from "../../../../../../utils/PremiumUtils";

const CurrentPersonalSubscription = ({ customHeading, hideShadow }) => {
  const mountedRef = useRef(true);
  // Component State
  const [isLoading, setIsLoading] = useState(true);
  const [showGetAPlan, setShowGetAPlan] = useState(false);
  const [planName, setPlanName] = useState(false);
  const [endDate, setEndDate] = useState(false);
  const [startDate, setStartDate] = useState(false);
  const [status, setStatus] = useState(false);

  const fetchIndividualUserSubscriptionDetails = () => {
    const functions = getFunctions();
    const fetchIndividualUserSubscriptionDetailsFF = httpsCallable(
      functions,
      "fetchIndividualUserSubscriptionDetails"
    );

    fetchIndividualUserSubscriptionDetailsFF()
      .then((res) => {
        if (!mountedRef.current) return null;
        if (res.data.success === false) {
          setShowGetAPlan(true);
          setIsLoading(false);
          return;
        }
        const userSubscriptionDetails = res.data.data;
        setStatus(userSubscriptionDetails.status);
        if (userSubscriptionDetails.status === "canceled") {
          setShowGetAPlan(true);
        }
        setPlanName(getPlanNameFromId(userSubscriptionDetails.rqPlanId));
        setEndDate(
          new Date(userSubscriptionDetails.endDate * 1000).toDateString()
        );
        setStartDate(
          new Date(userSubscriptionDetails.startDate * 1000).toDateString()
        );
        setIsLoading(false);
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        setIsLoading(false);
      });
  };

  const stableFetchIndividualSubscriptionData = useCallback(
    fetchIndividualUserSubscriptionDetails,
    []
  );

  const renderLoader = () => {
    return (
      <Row>
        <SpinnerColumn />
      </Row>
    );
  };

  const renderGetASubscription = () => {
    return <GetASubscription hideShadow={hideShadow} />;
  };

  const renderSubscriptionDetails = () => {
    return (
      <SubscriptionInfo
        hideManagePersonalSubscriptionButton={true}
        hideShadow={hideShadow}
        subscriptionDetails={{
          validTill: endDate,
          validFrom: startDate,
          status: status,
          type: "individual",
          planName: planName,
        }}
      />
    );
  };

  useEffect(() => {
    stableFetchIndividualSubscriptionData();
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchIndividualSubscriptionData]);

  return (
    <React.Fragment>
      <ProCard
        title={customHeading}
        className="primary-card github-like-border"
      >
        {isLoading
          ? renderLoader()
          : showGetAPlan
          ? renderGetASubscription()
          : renderSubscriptionDetails()}
      </ProCard>
    </React.Fragment>
  );
};

export default CurrentPersonalSubscription;

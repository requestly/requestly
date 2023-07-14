import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
// Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
import { getUserAuthDetails } from "../../../../store/selectors";
import { redirectToPaymentFailed, redirectToUpdateSubscription } from "../../../../utils/RedirectionUtils";
// Constants
import APP_CONSTANTS from "../../../../config/constants";

const VerifyAndContinueCheckout = ({
  mode,
  teamId,
  currency,
  duration,
  isPlanVerificationPassed,
  stripe,
  planType,
  quantity,
}) => {
  const mountedRef = useRef(true);

  // Global State
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [isSubscriptionCheckPassed, setIsSubscriptionCheckPassed] = useState(false);
  const [isCheckoutSessionProcessing, setIsCheckoutSessionProcessing] = useState(false);

  const initiateCheckoutSession = async () => {
    if (!mountedRef.current) return null;
    if (!isSubscriptionCheckPassed) return null;
    if (!isPlanVerificationPassed) return null;
    if (isCheckoutSessionProcessing) return null;
    setIsCheckoutSessionProcessing(true);

    const rqPlanId = "professional_12m"; // to fix

    let FFName;
    switch (mode) {
      case "individual":
        FFName = "createIndividualSubscriptionUsingStripeCheckout";
        break;
      case "team":
        FFName = "createTeamSubscriptionUsingStripeCheckout";
        break;
      default:
        // Invalid checkout mode
        redirectToPaymentFailed();
        return null;
    }
    const functions = getFunctions();
    const createSubscriptionUsingStripeCheckout = httpsCallable(functions, FFName);

    createSubscriptionUsingStripeCheckout({
      rqPlanId: rqPlanId,
      currency: currency,
      teamId: teamId,
      quantity: quantity,
      success_url:
        "http://" +
        window.location.host +
        APP_CONSTANTS.PATHS.PAYMENT_SUCCESS.ABSOLUTE +
        `?ref=stripe&paymentId=5357551a-e2d7`,
      cancel_url:
        "http://" +
        window.location.host +
        APP_CONSTANTS.PATHS.PAYMENT_FAIL.ABSOLUTE +
        `?ref=stripe&paymentId=5357551a-e2d7`,
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          // Use Stripe's checkout URL since ours is impacted by extension injecting the code
          // if (response.payload.url) {
          //   window.location.replace(response.payload.url);
          // } else {
          stripe.redirectToCheckout({
            sessionId: response.payload.checkoutSessionId,
          });
          // }
        } else {
          throw Error("couldn't create checkoutSessionId");
        }
      })
      .catch((err) => {
        redirectToPaymentFailed();
      });
  };

  const stableInitiateCheckoutSession = useCallback(initiateCheckoutSession, [
    isSubscriptionCheckPassed,
    isPlanVerificationPassed,
    isCheckoutSessionProcessing,
    mode,
    currency,
    teamId,
    quantity,
    stripe,
  ]);

  const fetchTeamInfo = () => {
    const functions = getFunctions();
    const getTeamInfo = httpsCallable(functions, "teams-getTeamInfo");

    if (!teamId) {
      setIsSubscriptionCheckPassed(true);
      return;
    }

    getTeamInfo({ teamId: teamId })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;

        if (response.success) {
          const teamInfo = response.data;

          // Handle case where an active subscription already exists
          if (teamInfo.subscriptionStatus === "active") {
            throw new Error("You are already premium");
          }

          setIsSubscriptionCheckPassed(true);
        } else {
          throw new Error("You might already have a subscription");
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        if (err) {
          setIsSubscriptionCheckPassed(false);
          toast.error("You might already have a subscription");
          redirectToUpdateSubscription({
            mode: "team",
            planType: "enterprise",
            teamId: teamId,
          });
        }
      });
  };

  const stableFetchTeamInfo = useCallback(fetchTeamInfo, [teamId]);

  const fetchUserInfo = () => {
    if (user && user.details && user.details.profile.email) {
      // Check if user already has a subscription
      const functions = getFunctions();
      const fetchIndividualUserSubscriptionDetailsFF = httpsCallable(
        functions,
        "fetchIndividualUserSubscriptionDetails"
      );

      fetchIndividualUserSubscriptionDetailsFF({})
        .then((res) => {
          if (!mountedRef.current) return null;
          const userSubscriptionDetails = res.data.data;

          if (res.data.success === true && userSubscriptionDetails.status === "active") {
            setIsSubscriptionCheckPassed(false);
            redirectToUpdateSubscription({
              mode: "individual",
              planType: "gold",
            });
          } else {
            setIsSubscriptionCheckPassed(true);
          }
        })
        .catch((err) => {
          if (!mountedRef.current) {
            setIsSubscriptionCheckPassed(true);
          }
        });
    }
  };

  const stableFetchUserInfo = useCallback(fetchUserInfo, [user]);

  useEffect(() => {
    if (isPlanVerificationPassed) {
      if (mode === "team") {
        stableFetchTeamInfo();
      } else if (mode === "individual") {
        stableFetchUserInfo();
      }
      if (mode && currency && duration && planType && isPlanVerificationPassed && isSubscriptionCheckPassed) {
        stableInitiateCheckoutSession();
      }
    }

    // Cleanup
    return () => {
      // mountedRef.current = false;
    };
  }, [
    stableFetchTeamInfo,
    stableFetchUserInfo,
    mode,
    isPlanVerificationPassed,
    currency,
    duration,
    stableInitiateCheckoutSession,
    isSubscriptionCheckPassed,
    planType,
  ]);

  return <></>;
};

export default VerifyAndContinueCheckout;

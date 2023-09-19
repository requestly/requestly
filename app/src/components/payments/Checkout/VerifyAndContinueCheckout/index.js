import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
// Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
import { getUserAuthDetails } from "../../../../store/selectors";
import { redirectToPaymentFailed, redirectToUpdateSubscriptionContactUs } from "../../../../utils/RedirectionUtils";
// Constants
import APP_CONSTANTS from "../../../../config/constants";

const VerifyAndContinueCheckout = ({
  mode,
  teamId,
  currency,
  duration,
  isPlanVerificationPassed,
  stripe,
  planName,
  quantity,
}) => {
  // Global State
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [isSubscriptionCheckPassed, setIsSubscriptionCheckPassed] = useState(false);
  const [isCheckoutSessionProcessing, setIsCheckoutSessionProcessing] = useState(false);

  const initiateCheckoutSession = useCallback(async () => {
    if (!isSubscriptionCheckPassed) return null;
    if (!isPlanVerificationPassed) return null;
    if (isCheckoutSessionProcessing) return null;
    setIsCheckoutSessionProcessing(true);

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
      currency: currency,
      teamId: teamId,
      quantity: quantity,
      planName,
      duration,
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
  }, [
    currency,
    duration,
    isCheckoutSessionProcessing,
    isPlanVerificationPassed,
    isSubscriptionCheckPassed,
    mode,
    planName,
    quantity,
    stripe,
    teamId,
  ]);

  const fetchTeamSubscriptionInfo = useCallback(() => {
    const functions = getFunctions();
    const getTeamInfo = httpsCallable(functions, "teams-getTeamInfo");

    if (!teamId) {
      setIsSubscriptionCheckPassed(true);
      return;
    }

    getTeamInfo({ teamId: teamId })
      .then((res) => {
        const response = res.data;

        if (response.success) {
          const teamInfo = response.data;

          // Handle case where an active subscription already exists
          if (teamInfo.subscriptionStatus === "active" || teamInfo.subscriptionStatus === "trialing") {
            throw new Error("You are already premium");
          }

          setIsSubscriptionCheckPassed(true);
        } else {
          throw new Error("You might already have a subscription");
        }
      })
      .catch((err) => {
        if (err) {
          setIsSubscriptionCheckPassed(false);
          toast.error("You might already have a subscription");
          redirectToUpdateSubscriptionContactUs();
        }
      });
  }, [teamId]);

  const fetchUserSubscriptionInfo = useCallback(() => {
    if (user && user.details && user.details.profile.email) {
      // Check if user already has a subscription
      const functions = getFunctions();
      const fetchIndividualUserSubscriptionDetails = httpsCallable(functions, "fetchIndividualUserSubscriptionDetails");

      fetchIndividualUserSubscriptionDetails({})
        .then((res) => {
          const userSubscriptionDetails = res.data.data;

          if (res.data.success === true && userSubscriptionDetails.status === "active") {
            setIsSubscriptionCheckPassed(false);
            redirectToUpdateSubscriptionContactUs();
          } else {
            setIsSubscriptionCheckPassed(true);
          }
        })
        .catch((err) => {
          setIsSubscriptionCheckPassed(true);
        });
    }
  }, [user]);

  useEffect(() => {
    if (isPlanVerificationPassed) {
      if (mode === "team") {
        fetchTeamSubscriptionInfo();
      } else if (mode === "individual") {
        fetchUserSubscriptionInfo();
      }
      if (mode && currency && duration && planName && isPlanVerificationPassed && isSubscriptionCheckPassed) {
        initiateCheckoutSession();
      }
    }
  }, [
    mode,
    isPlanVerificationPassed,
    currency,
    duration,
    isSubscriptionCheckPassed,
    initiateCheckoutSession,
    fetchUserSubscriptionInfo,
    fetchTeamSubscriptionInfo,
    planName,
  ]);

  return <></>;
};

export default VerifyAndContinueCheckout;

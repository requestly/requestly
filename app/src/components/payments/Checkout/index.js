import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "antd";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "utils/Toast.js";
import TextLoop from "react-text-loop";
// STRIPE
import { useStripe, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// SUB COMPONENTS
import VerifyAndContinueCheckout from "./VerifyAndContinueCheckout";
// UTILS
import * as RedirectionUtils from "../../../utils/RedirectionUtils";
// Static Asset
import RQIcon from "assets/img/brand/rq_logo.svg";
import Text from "antd/lib/typography/Text";
import APP_CONSTANTS from "config/constants";

const Checkout = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("m") ?? "individual"; // mode -> Defines what type of checkout we`re processing i.e. the individual or a team. Accepted values: "individual", "team"
  const teamId = urlParams.get("t");
  const planName = urlParams.get("p") ?? "professional";
  const duration = urlParams.get("d") ?? "annually";
  const quantity = urlParams.get("q");
  const currency = "usd";

  const [isPlanVerificationPassed, setIsPlanVerificationPassed] = useState(false);
  const antIcon = <LoadingOutlined style={{ color: "gray" }} spin />;

  const redirectTo404WithError = useCallback(
    (errMessage) => {
      toast.error(errMessage || "Invalid URL");
      RedirectionUtils.redirectTo404(navigate);
    },
    [navigate]
  );

  useEffect(() => {
    if (!duration) {
      return redirectTo404WithError("Plan duration not set");
    }
    if (![APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC, APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL].includes(planName)) {
      return redirectTo404WithError("Invalid plan type");
    }
    if (mode === "team" && !teamId && !quantity) {
      return redirectTo404WithError("No team selected");
    }

    setIsPlanVerificationPassed(true);
  }, [duration, mode, planName, quantity, redirectTo404WithError, teamId]);

  // const stableFetchUserCountry = useCallback(() => {
  //   fetch("https://api.country.is/")
  //     .then((res) => {
  //       if (!mountedRef.current) return null;
  //       if (res.status === 200) {
  //         res
  //           .json()
  //           .then((location) => {
  //             if (location.country) {
  //               setCountry(location.country);
  //             }
  //             // Use newly fetched country
  //             stableUpdatePlanInfo(location.country);
  //           })
  //           .catch((err) => {
  //             if (!mountedRef.current) return null;
  //             // Use existing/default country
  //             stableUpdatePlanInfo(country);
  //           });
  //       }
  //     })
  //     .catch((err) => {
  //       if (!mountedRef.current) return null;
  //       // Use existing/default country
  //       stableUpdatePlanInfo(country);
  //     });
  // },[country, stableUpdatePlanInfo]);

  return (
    <>
      <Row className="mb-2" justify={"center"}>
        <img alt="Please wait" src={RQIcon} style={{ width: "8vw" }} className="animation-pulse" />
      </Row>
      <Row justify={"center"}>
        <Text type="secondary">
          <Spin indicator={antIcon} /> &nbsp;&nbsp;
          <TextLoop interval={2500}>
            <span>Getting price plan...</span>
            <span>Checking payment provider...</span>
            <span>Setting your user...</span>
            <span>Loading pay gateway...</span>
            <span>This shouldn't take more than a minute...</span>
            <span>Almost done...</span>
          </TextLoop>
        </Text>
      </Row>

      <section className="section section-sm " style={{ display: "none" }}>
        <VerifyAndContinueCheckout
          mode={mode}
          teamId={teamId}
          currency={currency}
          duration={duration}
          isPlanVerificationPassed={isPlanVerificationPassed}
          stripe={stripe}
          planName={planName}
          quantity={quantity}
        />
      </section>
    </>
  );
};

const CheckoutIndex = () => {
  const [stripePromise, setStripePromise] = useState(false);

  useEffect(() => {
    if (!stripePromise) setStripePromise(loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY));
  }, [stripePromise]);

  return (
    <div>
      {stripePromise !== false ? (
        <Elements stripe={stripePromise}>
          <Checkout />
        </Elements>
      ) : null}
    </div>
  );
};

export default CheckoutIndex;

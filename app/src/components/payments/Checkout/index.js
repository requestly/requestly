/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
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
import * as PricingUtils from "../../../utils/PricingUtils";
// Static Asset
import RQIcon from "assets/img/brand/rq_logo.svg";
import Text from "antd/lib/typography/Text";

// const {
//   defaultCountry,
//   defaultCurrency,
//   getDefaultCurrencyBasedOnLocation,
//   getDurationTitleFromDays,
// } = PricingUtils;

// const Checkout = () => {
//   const navigate = useNavigate();
//   const mountedRef = useRef(true);
//   const stripe = useStripe();
//   const urlParams = new URLSearchParams(window.location.search);
//   const mode = urlParams.get("m"); // mode -> Defines what type of checkout we`re processing i.e. the individual or a team. Accepted values: "individual", "team"
//   const teamId = urlParams.get("t");
//   const planType = urlParams.get("p");
//   const days = urlParams.get("d");
//   const quantity = urlParams.get("q");
//   // Component State
//   const [country, setCountry] = useState(defaultCountry);
//   const [currency, setCurrency] = useState(defaultCurrency);
//   const [duration, setDuration] = useState(false);
//   const [isPlanVerificationPassed, setIsPlanVerificationPassed] = useState(
//     false
//   );
//   const antIcon = <LoadingOutlined style={{ color: "gray" }} spin />;

//   const plan = pricingPlans.find((p) => p.id === planType);

//   const redirectTo404WithError = (errMessage) => {
//     toast.error(errMessage || "Invalid URL");
//     RedirectionUtils.redirectTo404(navigate);
//   };

//   const stableRedirectTo404WithError = useCallback(redirectTo404WithError, [
//     navigate,
//   ]);

//   const updatePlanInfo = (userCountry) => {
//     const newCurrency = getDefaultCurrencyBasedOnLocation(userCountry);
//     if (!newCurrency) return stableRedirectTo404WithError();
//     setCurrency(newCurrency);

//     const newDuration = getDurationTitleFromDays(days);
//     if (!newDuration) return stableRedirectTo404WithError();
//     setDuration(newDuration);

//     const newPlanInfo = plan[newDuration];
//     if (!newPlanInfo) return stableRedirectTo404WithError();

//     const priceListOfDuration = newPlanInfo["price"];
//     if (!priceListOfDuration) return stableRedirectTo404WithError();

//     const priceForGivenCurrency = priceListOfDuration[newCurrency];
//     if (!priceForGivenCurrency) return stableRedirectTo404WithError();

//     setIsPlanVerificationPassed(true);
//   };

//   // const stableUpdatePlanInfo = useCallback(updatePlanInfo, [
//   //   days,
//   //   plan,
//   //   stableRedirectTo404WithError,
//   // ]);

//   // const fetchUserCountry = () => {
//   //   fetch("https://api.country.is/")
//   //     .then((res) => {
//   //       if (!mountedRef.current) return null;
//   //       if (res.status === 200) {
//   //         res
//   //           .json()
//   //           .then((location) => {
//   //             if (location.country) {
//   //               setCountry(location.country);
//   //             }
//   //             // Use newly fetched country
//   //             stableUpdatePlanInfo(location.country);
//   //           })
//   //           .catch((err) => {
//   //             if (!mountedRef.current) return null;
//   //             // Use existing/default country
//   //             stableUpdatePlanInfo(country);
//   //           });
//   //       }
//   //     })
//   //     .catch((err) => {
//   //       if (!mountedRef.current) return null;
//   //       // Use existing/default country
//   //       stableUpdatePlanInfo(country);
//   //     });
//   // };

//   // const stableFetchUserCountry = useCallback(fetchUserCountry, [
//   //   country,
//   //   stableUpdatePlanInfo,
//   // ]);

//   // useEffect(() => {
//   //   if (
//   //     !planType ||
//   //     !plan ||
//   //     !days ||
//   //     !(mode === "individual" || mode === "team")
//   //     // (mode === "team" ? typeof teamId !== "string" : false)
//   //   ) {
//   //     if (!mountedRef.current) return;
//   //     stableRedirectTo404WithError();
//   //   } else {
//   //     stableFetchUserCountry();
//   //   }

//   //   // Cleanup
//   //   return () => {
//   //     mountedRef.current = false;
//   //   };
//   // }, [
//   //   stableFetchUserCountry,
//   //   days,
//   //   mode,
//   //   plan,
//   //   planType,
//   //   stableRedirectTo404WithError,
//   //   teamId,
//   // ]);

//   return (
//     <Row>
//       <Col span={24}>
//         <Row className="mb-3 mt-8">
//           <Col span={24} align="center">
//             <img
//               alt="Please wait"
//               src={RQIcon}
//               style={{ width: "8vw" }}
//               className="animation-pulse"
//             />
//           </Col>
//         </Row>
//         <Row>
//           <Col span={24} align="center">
//             <Text type="secondary">
//               <Spin indicator={antIcon} /> &nbsp;&nbsp;
//               <TextLoop interval={2500}>
//                 <span>Getting price plan...</span>
//                 <span>Checking payment provider...</span>
//                 <span>Setting your user...</span>
//                 <span>Loading pay gateway...</span>
//                 <span>This shouldn't take more than a minute...</span>
//                 <span>Almost done...</span>
//               </TextLoop>
//             </Text>
//           </Col>
//         </Row>

//         <section className="section section-sm " style={{ display: "none" }}>
//           {/* <VerifyAndContinueCheckout
//             mode={mode}
//             teamId={teamId}
//             currency={currency}
//             duration={duration}
//             isPlanVerificationPassed={isPlanVerificationPassed}
//             stripe={stripe}
//             planType={planType}
//             quantity={quantity}
//           /> */}
//         </section>
//       </Col>
//     </Row>
//   );
// };

const CheckoutIndex = () => {
  // Component State
  const [stripePromise, setStripePromise] = useState(false);

  // useEffect(() => {
  //   if (!stripePromise)
  //     setStripePromise(
  //       loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  //     );
  // }, [stripePromise]);

  return (
    <Row>
      <Col span={24}>
        {/* {stripePromise !== false ? (
          <Elements stripe={stripePromise}>
            <Checkout />
          </Elements>
        ) : null} */}
      </Col>
    </Row>
  );
};

export default CheckoutIndex;

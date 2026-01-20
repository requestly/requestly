import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { toast } from "utils/Toast.js";
// STRIPE
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
// SUB COMPONENTS
import Alert from "../../misc/Alert";
import SpinnerColumn from "../../misc/SpinnerColumn";
// FIREBASE
import { getFunctions, httpsCallable } from "firebase/functions";
// UTILS
import { redirectTo404, redirectToTeam, redirectToPersonalSubscription } from "../../../utils/RedirectionUtils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import ProCard from "@ant-design/pro-card";
import { CheckOutlined } from "@ant-design/icons";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const UpdatePaymentMethod = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const mountedRef = useRef(true);
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("m"); // mode -> Defines what type of subscription we`re processing i.e. for the invididual or a team. Accepted values: "individual", "team"
  const teamId = urlParams.get("t");

  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [allowPaymentMethodUpdate, setAllowPaymentMethodUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!(mode === "individual" || mode === "team") || (mode === "team" ? typeof teamId !== "string" : false)) {
    redirectTo404(navigate);
  }

  const fetchTeamInfo = () => {
    const functions = getFunctions();
    const getTeamInfo = httpsCallable(functions, "teams-getTeamInfo");

    getTeamInfo({ teamId: teamId })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (!response.success) throw new Error("Unable to find team");
        const teamInfo = response.data;
        const { owner: ownerId } = teamInfo;
        if (ownerId && user && user.details && user.details.profile) {
          setAllowPaymentMethodUpdate(user.details.profile.uid === ownerId);
          setIsLoading(false);
        } else {
          setAllowPaymentMethodUpdate(false);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        if (err) {
          setAllowPaymentMethodUpdate(false);
          setIsLoading(false);
        }
      });
  };

  const stableFetchTeamInfo = useCallback(fetchTeamInfo, [teamId, user]);

  const savePaymentMethod = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setErrorMessage(null);
    setSuccess(false);

    let hasError = false;
    let paymentMethodId = "";

    setCardError(null);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    // Reference to a mounted CardElement. Elements knows how
    // to find CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setCardError(error.message);
      hasError = true;
    } else {
      paymentMethodId = paymentMethod.id;
    }

    const firebaseFunctionToCall = mode === "individual" ? "updateIndividualPaymentMethod" : "updateTeamPaymentMethod";

    if (!hasError) {
      const functions = getFunctions();
      const updateTeamPaymentMethod = httpsCallable(functions, firebaseFunctionToCall);

      updateTeamPaymentMethod({
        teamId: teamId ? teamId : false,
        paymentMethodId: paymentMethodId,
      })
        .then((res) => {
          const response = res.data;
          if (response.success) {
            setSuccess(true);
            setProcessing(false);
            toast.info("The payment method has been successfully updated.");
            if (mode === "individual") {
              redirectToPersonalSubscription(navigate, true, true);
            } else {
              redirectToTeam(navigate, teamId);
            }
          } else {
            throw new Error("Unable to update. Please contact us");
          }
        })
        .catch((err) => {
          setProcessing(false);
          setErrorMessage(err.message);
        });
    } else {
      setProcessing(false);
    }
  };

  const renderCardElement = () => {
    return (
      <div className="row justify-content-md-center">
        <div className="col col-sm-12 col-md-8 col-lg-8 col-xl-6">
          <div className="card-deck">
            <div className="card mb-4">
              <div className="card-header text-center">Credit or debit card</div>
              <div className="card-body">
                <div className="row justify-content-md-center">
                  <div className="col col-12">
                    {cardError !== null && (
                      <Alert
                        type="danger"
                        message={cardError}
                        dismissible={true}
                        onDismiss={() => setCardError(null)}
                      ></Alert>
                    )}
                    <CardElement></CardElement>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="primary"
            // className="btn btn-lg btn-block btn-primary"
            loading={processing ? true : false}
            onClick={savePaymentMethod}
            icon={<CheckOutlined />}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const renderLoader = () => {
    return <SpinnerColumn />;
  };

  const renderUpdatePaymentMethodNotAllowed = () => {
    return (
      <Jumbotron style={{ background: "transparent" }} className="text-center">
        <p>Only the team owner can update the payment method.</p>
        <p>
          Need help? Contact us at{" "}
          <a href={"mailto:" + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}>
            {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
          </a>
        </p>
      </Jumbotron>
    );
  };

  useEffect(() => {
    if (mode === "team") {
      stableFetchTeamInfo();
    } else if (mode === "individual") {
      setAllowPaymentMethodUpdate(true);
      setIsLoading(false);
    }
    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, [mode, stableFetchTeamInfo]);

  return (
    <React.Fragment>
      <div className="card-deck mb-3">
        <div className="card has-no-box-shadow">
          <div className="card-body">
            {success && (
              <Alert
                type="success"
                message="The payment method has been successfully updated."
                dismissible={true}
                onDismiss={() => setSuccess(false)}
              ></Alert>
            )}
            {errorMessage !== null && (
              <Alert
                type="danger"
                message={errorMessage}
                dismissible={true}
                onDismiss={() => setErrorMessage(null)}
              ></Alert>
            )}
            {isLoading
              ? renderLoader()
              : allowPaymentMethodUpdate
              ? renderCardElement()
              : renderUpdatePaymentMethodNotAllowed()}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const UpdatePaymentMethodIndex = () => {
  // Component State
  const [stripePromise, setStripePromise] = useState(false);

  useEffect(() => {
    // Initialize Stripe
    if (!stripePromise) setStripePromise(loadStripe(process.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY));
  }, [stripePromise]);

  return (
    <ProCard className="primary-card github-like-border" title="Update Payment Method">
      <Row>
        <Col span={4} offset={10} align="center">
          {stripePromise !== false ? (
            <Elements stripe={stripePromise}>
              <UpdatePaymentMethod />
            </Elements>
          ) : null}
        </Col>
      </Row>
    </ProCard>
  );
};

export default UpdatePaymentMethodIndex;

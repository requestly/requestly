import React, { useState } from "react";
import { RQModal } from "lib/design-system/components";
import "./PricingModal.css";
import PricingTable from "components/landing/pricing/PricingTable";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import { Button } from "antd";
import StripeCheckout from "./StripeCheckout";
import { getFunctions, httpsCallable } from "firebase/functions";

const InAppCheckoutModal = ({ isOpen, toggleModal, callback, source }) => {
  const [step, setStep] = useState(1);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);

  const handleSubscribe = () => {
    const functions = getFunctions();
    const createStripeSubscription = httpsCallable(functions, "createStripeSubscription");

    createStripeSubscription({
      currency: "usd",
      teamId: null,
      quantity: 1,
      planName: "professional",
      duration: "monthly",
    }).then((data) => {
      console.log({ data });
      setStripeClientSecret(data?.data?.clientSecret);
      setStep(2);
    });
  };
  const renderStep1 = () => {
    return (
      <>
        <center>
          <Button type="primary" size="large" onClick={() => handleSubscribe()}>
            Subscribe
          </Button>
        </center>
        <PricingTable />
      </>
    );
  };

  const renderStep2 = () => {
    return (
      <>
        <Button size="large" onClick={() => setStep(1)}>
          <BiArrowBack />
        </Button>
        <StripeCheckout setStep={setStep} stripeClientSecret={stripeClientSecret} />
      </>
    );
  };

  const renderStep3 = () => {
    return (
      <>
        <Button size="large" onClick={() => setStep(2)}>
          <BiArrowBack />
        </Button>
        <center>
          <h1>SUCCESS</h1>
        </center>
      </>
    );
  };

  return (
    <RQModal centered open={isOpen} onCancel={toggleModal} className="pricing-modal" width={"50%"}>
      <div className="rq-modal-content">{step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}</div>
    </RQModal>
  );
};

export default InAppCheckoutModal;

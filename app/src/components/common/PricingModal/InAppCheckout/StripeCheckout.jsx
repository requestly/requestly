import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./StripeCheckout.css";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  "pk_test_51KflXlDiNNz2hbmOUApXI81Y1qQu3F9dt0xmoC79bnNjJnYU1tRr7YpkjSMOqI5kVKesBVv4HEfa5m6NMjSmolC600bkl82JE6"
);

export default function StripeCheckout({ setStep, stripeClientSecret }) {
  const appearance = {
    theme: "night",
  };
  const options = {
    clientSecret: stripeClientSecret,
    appearance,
  };

  return (
    <div className="App">
      {stripeClientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm setStep={setStep} stripeClientSecret={stripeClientSecret} />
        </Elements>
      )}
    </div>
  );
}

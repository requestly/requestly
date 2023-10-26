import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./StripeCheckout.css";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  "pk_test_51KflXlDiNNz2hbmOUApXI81Y1qQu3F9dt0xmoC79bnNjJnYU1tRr7YpkjSMOqI5kVKesBVv4HEfa5m6NMjSmolC600bkl82JE6"
);

export default function StripeCheckout({ setStep, clientSecret }) {
  const appearance = {
    theme: "night",
  };
  const options = {
    clientSecret,
  };

  return (
    <div className="App">
      {clientSecret ? (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout style={{ width: "50%" }} className="embed-checkout" />
        </EmbeddedCheckoutProvider>
      ) : null}
    </div>
  );
}

import React from "react";
//SUB COMPONENTS
import Checkout from "../../../../components/payments/Checkout";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const CheckoutView = () => {
  return (
    <>
      <ProtectedRoute component={Checkout} hardRedirect={true} />
    </>
  );
};

export default CheckoutView;

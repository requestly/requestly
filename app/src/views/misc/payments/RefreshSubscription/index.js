import React from "react";
//SUB COMPONENTS
import RefreshSubscription from "../../../../components/payments/RefreshSubscription";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const RefreshSubscriptionView = () => {
  return (
    <>
      <ProtectedRoute component={RefreshSubscription} />
    </>
  );
};

export default RefreshSubscriptionView;

import React from "react";
//SUB COMPONENTS
import UpdateSubscription from "../../../../components/payments/UpdateSubscription";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const UpdateSubscriptionView = () => {
  return (
    <>
      <ProtectedRoute component={UpdateSubscription} />
    </>
  );
};

export default UpdateSubscriptionView;

import React from "react";
//SUB COMPONENTS
import UpdateSubscriptionContactUs from "../../../../components/payments/UpdateSubscriptionContactUs";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const UpdateSubscriptionContactUsView = () => {
  return (
    <>
      <ProtectedRoute component={UpdateSubscriptionContactUs} />
    </>
  );
};

export default UpdateSubscriptionContactUsView;

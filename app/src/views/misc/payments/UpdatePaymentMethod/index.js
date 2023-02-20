import React from "react";
//SUB COMPONENTS
import UpdatePaymentMethod from "../../../../components/payments/UpdatePaymentMethod";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const UpdatePaymentMethodView = () => {
  return (
    <>
      <ProtectedRoute component={UpdatePaymentMethod} />
    </>
  );
};

export default UpdatePaymentMethodView;

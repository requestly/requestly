import React from "react";
//SUB COMPONENTS
import ProtectedRoute from "../../authentication/ProtectedRoute";
import ManageAccount from "./ManageAccount";

const Account = () => {
  return <ProtectedRoute component={ManageAccount} />;
};

export default Account;

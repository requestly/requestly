import ProtectedRoute from "components/authentication/ProtectedRoute";
import MyOrganization from "components/user/MyOrganization";
import React from "react";

const MyOrganizationView = () => {
  return (
    <>
      <ProtectedRoute component={MyOrganization} />
    </>
  );
};

export default MyOrganizationView;

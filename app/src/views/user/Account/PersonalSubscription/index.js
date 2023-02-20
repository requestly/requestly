import React from "react";
//SUB COMPONENTS
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";
//VIEWS
import PersonalSubscription from "../../../../components/user/AccountIndexPage/ManageAccount/PersonalSubscription";

const TeamViewerIndex = () => {
  return (
    <>
      <ProtectedRoute component={PersonalSubscription} />
    </>
  );
};

export default TeamViewerIndex;

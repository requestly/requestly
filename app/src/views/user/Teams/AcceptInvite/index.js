import React from "react";
//SUB COMPONENTS
import AcceptTeamInvite from "../../../../components/user/Teams/AcceptTeamInvite";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

const AcceptTeamInviteView = () => {
  return (
    <>
      <ProtectedRoute component={AcceptTeamInvite} />
    </>
  );
};

export default AcceptTeamInviteView;

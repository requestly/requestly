import React from "react";
//SUB COMPONENTS
import ProtectedRoute from "../../../../../components/authentication/ProtectedRoute";
//VIEWS
import MyTeams from "../../../../../components/user/AccountIndexPage/ManageAccount/ManageTeams/MyTeams";

const MyTeamsView = () => {
  return (
    <>
      <ProtectedRoute component={MyTeams} />
    </>
  );
};

export default MyTeamsView;

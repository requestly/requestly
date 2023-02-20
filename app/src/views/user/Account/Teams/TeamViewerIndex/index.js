import React from "react";
import { useParams } from "react-router-dom";
//SUB COMPONENTS
import ProtectedRoute from "../../../../../components/authentication/ProtectedRoute";
//VIEWS
import TeamViewer from "../../../../../components/user/AccountIndexPage/ManageAccount/ManageTeams/TeamViewer";

const TeamViewerIndex = () => {
  const teamId = useParams().teamId;
  return (
    <>
      <ProtectedRoute component={TeamViewer} teamId={teamId} />
    </>
  );
};

export default TeamViewerIndex;

import React from "react";
import CreateFirstTeam from "./CreateFirstTeam";
import TeamsList from "./TeamsList";
import { useSelector } from "react-redux";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";

const ManageTeams = () => {
  // Global State
  const availableWorkspaces = useSelector(getAllWorkspaces);

  return (
    <>
      <div>
        {availableWorkspaces && availableWorkspaces.length > 0 ? (
          <TeamsList teams={availableWorkspaces} />
        ) : (
          <>
            <CreateFirstTeam />
          </>
        )}
      </div>
    </>
  );
};

export default ManageTeams;

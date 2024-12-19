import React from "react";
import CreateFirstTeam from "./CreateFirstTeam";
import TeamsList from "./TeamsList";
import { useSelector } from "react-redux";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";

const ManageTeams = () => {
  // Global State
  const workspaces = useSelector(getAllWorkspaces);

  return (
    <>
      <div>
        {workspaces && workspaces.length > 0 ? (
          <TeamsList teams={workspaces} />
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

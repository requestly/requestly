import React from "react";
import CreateFirstTeam from "./CreateFirstTeam";
import TeamsList from "./TeamsList";
import { useSelector } from "react-redux";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";

const ManageTeams = () => {
  // Global State
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const filteredAvailableWorkspace = availableWorkspaces?.filter((workspace) => !workspace.browserstackDetails);

  return (
    <>
      <div>
        {filteredAvailableWorkspace && filteredAvailableWorkspace.length > 0 ? (
          <TeamsList teams={filteredAvailableWorkspace} />
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

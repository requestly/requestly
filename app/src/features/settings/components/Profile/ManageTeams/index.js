import React from "react";
import CreateFirstTeam from "./CreateFirstTeam";
import TeamsList from "./TeamsList";
import { useSelector } from "react-redux";
import { getAvailableTeams } from "store/features/teams/selectors";

const ManageTeams = () => {
  // Global State
  const teams = useSelector(getAvailableTeams);

  return (
    <>
      <div>
        {teams && teams.length > 0 ? (
          <TeamsList teams={teams} />
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

// TODO-syncing: Improve UI-UX
import React, { useCallback, useEffect, useState } from "react";
import SettingsItem from "features/settings/components/GlobalSettings/components/SettingsItem";
import { getWorkspaceById } from "store/slices/workspaces/selectors";
import { useSelector } from "react-redux";
import { setWorkspaceSyncState } from "backend/workspace";

interface Props {
  teamId: string;
  isTeamAdmin: boolean;
  isTeamArchived: boolean;
  teamOwnerId: string;
}

const PersonalWorkspaceSettings: React.FC<Props> = ({ teamId }) => {
  const isSyncEnabled = useSelector(getWorkspaceById(teamId))?.isSyncEnabled;
  const [isSyncEnabledLocal, setIsSyncEnabledLocal] = useState(true);

  useEffect(() => {
    setIsSyncEnabledLocal(isSyncEnabled);
  }, [isSyncEnabled]);

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSyncing = useCallback(
    (status: boolean) => {
      setIsLoading(true);
      setIsSyncEnabledLocal(status);
      setWorkspaceSyncState(teamId, status)
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          setIsSyncEnabledLocal(!status);
          setIsLoading(false);
          console.error("Error while toggling syncing", err);
        });
    },
    [teamId]
  );

  return (
    <>
      <div className="team-settings-container">
        <SettingsItem
          loading={isLoading}
          isActive={!!isSyncEnabledLocal}
          onChange={handleToggleSyncing}
          title="Toggle syncing in personal workspaces"
        />
      </div>
    </>
  );
};

export default PersonalWorkspaceSettings;

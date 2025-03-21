import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import SettingsItem from "features/settings/components/GlobalSettings/components/SettingsItem";
import { getUserWorkspaceConfig, setUserWorkspaceRuleMetadataSyncType } from "backend/workspace";
import { RuleMetadataSyncType } from "backend/workspace/types";

interface Props {
  teamId: string;
}

const WorkspaceRuleMetadataSyncing: React.FC<Props> = ({ teamId }) => {
  const userId = useSelector(getUserAuthDetails)?.details?.profile?.uid;

  const [isGlobalSyncEnabled, setIsGlobalSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    getUserWorkspaceConfig(userId, teamId).then((config) => {
      const isSyncEnabled = config?.ruleMetadataSyncType === RuleMetadataSyncType.GLOBAL ? true : false;
      console.log({ isSyncEnabled, config });
      setIsGlobalSyncEnabled(isSyncEnabled);
      setIsLoading(false);
    });

    setIsLoading(false);
  }, [isGlobalSyncEnabled, teamId, userId]);

  const handleToggleStatusSyncing = useCallback(
    (status: boolean) => {
      setIsLoading(true);
      setIsGlobalSyncEnabled(status);

      setUserWorkspaceRuleMetadataSyncType(
        userId,
        teamId,
        status ? RuleMetadataSyncType.GLOBAL : RuleMetadataSyncType.USER
      )
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          setIsGlobalSyncEnabled(!status);
          setIsLoading(false);
          console.error("Error while toggling syncing", err);
        });
    },
    [teamId, userId]
  );

  return (
    <SettingsItem
      loading={isLoading}
      isActive={isGlobalSyncEnabled}
      onChange={handleToggleStatusSyncing}
      title="Enable Rule Metadata (Status & Favorite) syncing in team workspaces"
      caption="Stay updated by automatically syncing rule status and favorite with your teammates."
    />
  );
};

export default WorkspaceRuleMetadataSyncing;

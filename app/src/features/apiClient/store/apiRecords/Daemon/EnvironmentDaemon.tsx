import { VariableScope } from "backend/environment/types";
import { useApiClientRepository } from "features/apiClient/slices";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";
import { environmentsActions, useActiveEnvironmentId } from "features/apiClient/slices/environments";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { mergeSyncedVariablesPreservingLocalValue } from "features/apiClient/slices/utils/syncVariables";
import React, { useEffect } from "react";
const EnvironmentDaemon: React.FC = () => {
  const { environmentVariablesRepository } = useApiClientRepository();
  const dispatch = useApiClientDispatch();

  const activeEnvironmentId = useActiveEnvironmentId();

  useEffect(() => {
    if (!activeEnvironmentId) return;

    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.ENVIRONMENT,
      id: activeEnvironmentId,
      callback: (updatedEnvironmentData) => {
        dispatch(
          environmentsActions.unsafePatch({
            id: activeEnvironmentId,
            patcher: (env) => {
              env.variables = mergeSyncedVariablesPreservingLocalValue(env.variables, updatedEnvironmentData.variables);
            },
          })
        );
      },
    });
    return unsubscribe;
  }, [environmentVariablesRepository, activeEnvironmentId, dispatch]);

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.GLOBAL,
      id: GLOBAL_ENVIRONMENT_ID,
      callback: (updatedEnvironmentData) => {
        dispatch(
          environmentsActions.unsafePatchGlobal({
            patcher: (env) => {
              env.variables = mergeSyncedVariablesPreservingLocalValue(env.variables, updatedEnvironmentData.variables);
            },
          })
        );
      },
    });
    return unsubscribe;
  }, [environmentVariablesRepository, dispatch]);
  return null;
};

export default EnvironmentDaemon;

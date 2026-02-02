import { VariableScope } from "backend/environment/types";
import { useApiClientRepository } from "features/apiClient/slices";
import {
  environmentsActions,
  useActiveEnvironmentId,
  useGlobalEnvironment,
} from "features/apiClient/slices/environments";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { mergeSyncedVariablesPreservingLocalValue } from "features/apiClient/slices/utils/syncVariables";
import React, { useEffect } from "react";
const EnvironmentDaemon: React.FC = () => {
  const { environmentVariablesRepository } = useApiClientRepository();
  const dispatch = useApiClientDispatch();

  const activeEnvironmentId = useActiveEnvironmentId();
  const globalEnvironment = useGlobalEnvironment();

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
      id: globalEnvironment.id,
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
  }, [environmentVariablesRepository, dispatch, globalEnvironment.id]);
  return null;
};

export default EnvironmentDaemon;

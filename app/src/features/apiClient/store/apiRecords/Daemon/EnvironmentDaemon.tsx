import React, { useEffect } from "react";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { VariableScope } from "backend/environment/types";
import { useAPIEnvironment } from "../ApiRecordsContextProvider";
import { EnvironmentsState } from "../../environments/environments.store";

function getActiveEnvironmentVariableStoreSelector(state: EnvironmentsState) {
  return state.activeEnvironment?.data.variables;
}

function getGlobalEnvironmentVariableStoreSelector(state: EnvironmentsState) {
  return state.globalEnvironment.data.variables;
}

const EnvironmentDaemon: React.FC = () => {
  const { activeEnvironmentId, globalEnvironement, activeEnvVarStore, globalEnvVarStore } = useAPIEnvironment(
    (state) => {
      return {
        activeEnvironmentId: state.activeEnvironment?.id,
        globalEnvironement: state.globalEnvironment,
        activeEnvVarStore: getActiveEnvironmentVariableStoreSelector(state),
        globalEnvVarStore: getGlobalEnvironmentVariableStoreSelector(state),
      };
    }
  );
  const { environmentVariablesRepository } = useApiClientRepository();

  useEffect(() => {
    if (!activeEnvironmentId) return;
    const unsusbscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.ENVIRONMENT,
      id: activeEnvironmentId,
      callback: (updatedEnvironmentData) => {
        activeEnvVarStore?.getState().mergeAndUpdate(updatedEnvironmentData.variables);
      },
    });
    return unsusbscribe;
  }, [environmentVariablesRepository, activeEnvironmentId, activeEnvVarStore]);

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.ENVIRONMENT,
      id: globalEnvironement.id,
      callback: (updatedEnvironmentData) => {
        globalEnvVarStore.getState().mergeAndUpdate(updatedEnvironmentData.variables);
      },
    });
    return unsubscribe;
  }, [environmentVariablesRepository, globalEnvVarStore, globalEnvironement.id]);
  return null;
};

export default EnvironmentDaemon;

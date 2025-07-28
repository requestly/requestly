import React, { useEffect } from "react";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { VariableScope } from "backend/environment/types";
import { useAPIEnvironment } from "../ApiRecordsContextProvider";

const EnvironmentDaemon: React.FC = () => {
  const { globalEnvironement, activeEnvrionment } = useAPIEnvironment((state) => {
    return {
      activeEnvrionment: state.activeEnvironment,
      globalEnvironement: state.globalEnvironment,
    };
  });
  const { environmentVariablesRepository } = useApiClientRepository();

  useEffect(() => {
    if (!activeEnvrionment) return;
    const unsusbscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.ENVIRONMENT,
      id: activeEnvrionment.id,
      callback: (updatedEnvironmentData) => {
        activeEnvrionment.data.variables?.getState().mergeAndUpdate(updatedEnvironmentData.variables);
      },
    });
    return unsusbscribe;
  }, [environmentVariablesRepository, activeEnvrionment]);

  useEffect(() => {
    const unsubscribe = environmentVariablesRepository.attachListener({
      scope: VariableScope.ENVIRONMENT,
      id: globalEnvironement.id,
      callback: (updatedEnvironmentData) => {
        globalEnvironement.data.variables.getState().mergeAndUpdate(updatedEnvironmentData.variables);
      },
    });
    return unsubscribe;
  }, [environmentVariablesRepository, globalEnvironement]);
  return null;
};

export default EnvironmentDaemon;

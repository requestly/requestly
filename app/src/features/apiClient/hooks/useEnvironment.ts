import { useCallback } from "react";
import {
  EnvironmentData,
  EnvironmentMap,
  EnvironmentVariables,
  EnvironmentVariableType,
} from "../../../backend/environment/types";
import Logger from "lib/logger";
import { notification } from "antd";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useApiClientRepository } from "../helpers/modules/sync/useApiClientSyncRepo";
import { Environment } from "../store/environments/environments.store";

export const useEnvironment = () => {
  const syncRepository = useApiClientRepository();
  const [
    setActive,
    createNewEnvironment,
    activeEnvironment,
    getEnvironment,
    globalEnvironment,
    updateEnvironment,
    removeEnvironment,
    getAll,
  ] = useAPIEnvironment((s) => [
    s.setActive,
    s.create,
    s.activeEnvironment,
    s.getEnvironment,
    s.globalEnvironment,
    s.update,
    s.delete,
    s.getAll,
  ]);

  const setActiveEnvironment = useCallback(
    (id?: EnvironmentData["id"]) => {
      setActive(id);
    },
    [setActive]
  );

  const getAllEnvironments = useCallback(() => {
    return Object.entries(Object.fromEntries(getAll())).map(([key, value]) => {
      return {
        id: key,
        name: value.name,
      };
    });
  }, [getAll]);

  const _environmentDataAdapter = useCallback((env: Environment): EnvironmentData => {
    return {
      id: env.id,
      name: env.name,
      variables: Object.fromEntries(env.data.variables.getState().getAll()),
    };
  }, []);

  const getActiveEnvironment = useCallback(() => {
    if (!activeEnvironment) {
      return;
    }

    return _environmentDataAdapter(activeEnvironment);
  }, [activeEnvironment, _environmentDataAdapter]);

  const addNewEnvironment = useCallback(
    async (newEnvironmentName: string) => {
      try {
        const newEnvironment = await syncRepository.environmentVariablesRepository.createNonGlobalEnvironment(
          newEnvironmentName
        );

        createNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name });
        return { id: newEnvironment.id, name: newEnvironment.name };
      } catch (err) {
        notification.error({
          message: "Error while creating a new environment",
          description: err?.message,
          placement: "bottomRight",
        });
      }
    },
    [syncRepository, createNewEnvironment]
  );

  const setVariables = useCallback(
    async (environmentId: string, variables: EnvironmentVariables) => {
      const newVariablesWithSyncvalues: EnvironmentVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value], index) => {
          const typeToSaveInDB =
            value.type === EnvironmentVariableType.Secret
              ? EnvironmentVariableType.Secret
              : (typeof value.syncValue as EnvironmentVariableType);
          return [
            key.trim(),
            { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB, id: index },
          ];
        })
      );

      try {
        await syncRepository.environmentVariablesRepository.updateEnvironment(environmentId, {
          variables: newVariablesWithSyncvalues,
        });

        const env = getEnvironment(environmentId);

        if (!env) {
          throw new Error("Environment not found! ");
        }

        env.data.variables.getState().mergeAndUpdate(newVariablesWithSyncvalues);
      } catch (err) {
        notification.error({
          message: "Error while setting environment variables.",
          description: err?.message,
          placement: "bottomRight",
        });
        Logger.error("Error while setting environment variables in db", err);
      }
    },
    [syncRepository, getEnvironment]
  );

  const getEnvironmentById = useCallback(
    (environmentId: string): EnvironmentData => {
      if (environmentId === globalEnvironment.id) {
        return _environmentDataAdapter(globalEnvironment);
      }

      const env = getEnvironment(environmentId);

      if (!env) {
        throw new Error("Environment not found! ");
      }

      return _environmentDataAdapter(env);
    },
    [globalEnvironment, getEnvironment, _environmentDataAdapter]
  );

  const getGlobalEnvironment = useCallback((): EnvironmentData => {
    return _environmentDataAdapter(globalEnvironment);
  }, [globalEnvironment, _environmentDataAdapter]);

  const renameEnvironment = useCallback(
    async (environmentId: string, newName: string) => {
      try {
        await syncRepository.environmentVariablesRepository.updateEnvironment(environmentId, { name: newName });
        updateEnvironment(environmentId, { name: newName });
      } catch (err) {
        notification.error({
          message: "Error while renaming environment",
          description: err?.message,
          placement: "bottomRight",
        });
      }
    },
    [updateEnvironment, syncRepository]
  );

  const duplicateEnvironment = useCallback(
    async (environmentId: string) => {
      try {
        const envsMap: EnvironmentMap = {};
        getAll().forEach((value) => {
          envsMap[value.id] = getEnvironmentById(value.id);
        });

        const newEnvironment = await syncRepository.environmentVariablesRepository.duplicateEnvironment(
          environmentId,
          envsMap
        );

        createNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name });
        getEnvironment(newEnvironment.id)?.data.variables.getState().mergeAndUpdate(newEnvironment.variables);
      } catch (err) {
        notification.error({
          message: "Error while duplicating environment",
          description: err?.message,
          placement: "bottomRight",
        });
      }
    },
    [getAll, createNewEnvironment, getEnvironment, syncRepository, getEnvironmentById]
  );

  const deleteEnvironment = useCallback(
    async (environmentId: string) => {
      try {
        await syncRepository.environmentVariablesRepository.deleteEnvironment(environmentId);
        removeEnvironment(environmentId);
      } catch (err) {
        notification.error({
          message: "Error while deleting environment",
          description: err?.message,
          placement: "bottomRight",
        });
      }
    },
    [removeEnvironment, syncRepository]
  );

  return {
    getAllEnvironments,
    getEnvironmentById,
    getActiveEnvironment,
    getGlobalEnvironment,

    setVariables,
    setActiveEnvironment,
    addNewEnvironment,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
  };
};

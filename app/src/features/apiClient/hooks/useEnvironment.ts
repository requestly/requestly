import { useCallback } from "react";
import {
  EnvironmentData,
  EnvironmentMap,
  EnvironmentVariables,
  EnvironmentVariableType,
  EnvironmentVariableValue,
} from "../../../backend/environment/types";
import { renderTemplate } from "../../../backend/environment/utils";
import Logger from "lib/logger";
import { notification } from "antd";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useApiClientRepository } from "../helpers/modules/sync/useApiClientSyncRepo";

export const useEnvironment = () => {
  const syncRepository = useApiClientRepository();
  const [
    setCurrentEnvironment,
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

  // TODO: TBD
  const fetchAndUpdateEnvironments = useCallback(async () => {}, []);

  // TODO: TBD
  const forceRefreshEnvironments = useCallback(() => {
    fetchAndUpdateEnvironments();
  }, [fetchAndUpdateEnvironments]);

  const getCurrentEnvironment = useCallback(() => {
    return {
      currentEnvironmentId: activeEnvironment?.id,
      currentEnvironmentName: activeEnvironment?.name,
    };
  }, [activeEnvironment]);

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

  // resolver
  // TODO: to be removed from this hook
  const getVariablesWithPrecedence = useCallback((currentCollectionId: string): Record<
    string,
    EnvironmentVariableValue
  > => {
    const allVariables: Record<string, EnvironmentVariableValue> = {};
    return allVariables;
  }, []);

  // TODO: to be removed from this hook
  const renderVariables = useCallback(
    <T extends string | Record<string, any>>(
      template: T,
      requestCollectionId: string = ""
    ): {
      renderedVariables?: Record<string, unknown>;
      result: T;
    } => {
      const variablesWithPrecedence = getVariablesWithPrecedence(requestCollectionId);

      const { renderedTemplate, renderedVariables } = renderTemplate(template, variablesWithPrecedence);
      return { renderedVariables, result: renderedTemplate };
    },
    [getVariablesWithPrecedence]
  );

  const getEnvironmentById = useCallback(
    (environmentId: string): EnvironmentData => {
      if (environmentId === globalEnvironment.id) {
        return {
          id: globalEnvironment.id,
          name: globalEnvironment.name,
          variables: Object.fromEntries(globalEnvironment.data.variables.getState().getAll()),
        };
      }

      const env = getEnvironment(environmentId);

      if (!env) {
        throw new Error("Environment not found! ");
      }

      return { id: env.id, name: env.name, variables: Object.fromEntries(env.data.variables.getState().getAll()) };
    },
    [globalEnvironment, getEnvironment]
  );

  const getCurrentEnvironmentVariables = useCallback((): EnvironmentVariables => {
    if (!activeEnvironment?.id) {
      throw new Error("No active environment!");
    }

    return getEnvironmentById(activeEnvironment?.id).variables;
  }, [activeEnvironment?.id, getEnvironmentById]);

  const getGlobalVariables = useCallback((): EnvironmentVariables => {
    return Object.fromEntries(globalEnvironment.data.variables.getState().getAll());
  }, [globalEnvironment]);

  const getAllEnvironments = useCallback(() => {
    return Object.entries(Object.fromEntries(getAll())).map(([key, value]) => {
      return {
        id: key,
        name: value.name,
      };
    });
  }, [getAll]);

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
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironment,
    setVariables,
    getCurrentEnvironmentVariables,
    getAllEnvironments,
    getEnvironmentById,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getGlobalVariables,
    forceRefreshEnvironments,

    renderVariables,
    getVariablesWithPrecedence,
  };
};

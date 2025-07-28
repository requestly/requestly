import { useEffect, useMemo, useCallback, useRef } from "react";
import { EnvironmentData, EnvironmentVariables, EnvironmentVariableType, EnvironmentVariableValue } from "../types";
import { useSelector } from "react-redux";
import {
  getAllEnvironmentData,
  getCollectionVariables,
  getCurrentEnvironmentId,
} from "store/features/variables/selectors";
import { renderTemplate } from "../utils";
import Logger from "lib/logger";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import { getOwnerId } from "backend/utils";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { notification } from "antd";
import { useAPIEnvironment, useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";

// higher precedence is given to environment variables
const VARIABLES_PRECEDENCE_ORDER = ["ENVIRONMENT", "COLLECTION"];

const useEnvironmentManager = () => {
  const [getData, getRecordStore] = useAPIRecords((s) => [s.getData, s.getRecordStore]);
  const { onSaveRecord } = useApiClientContext();
  const [
    setCurrentEnvironment,
    createNewEnvironment,
    activeEnvironment,
    getEnvironment,
    globalEnvironment,
    updateEnvironment,
    removeEnvironment,
  ] = useAPIEnvironment((s) => [
    s.setActive,
    s.create,
    s.activeEnvironment,
    s.getEnvironment,
    s.globalEnvironment,
    s.update,
    s.delete,
  ]);

  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);
  const collectionVariables = useSelector(getCollectionVariables);
  const ownerId = getOwnerId(user?.details?.profile?.uid, activeWorkspaceId);

  const syncRepository = useApiClientRepository();

  const activeOwnerEnvironments = useMemo(() => {
    return allEnvironmentData?.[ownerId] ?? {};
  }, [allEnvironmentData, ownerId]);

  const activeOwnerEnvironmentsRef = useRef(activeOwnerEnvironments);
  useEffect(() => {
    activeOwnerEnvironmentsRef.current = activeOwnerEnvironments;
  }, [activeOwnerEnvironments]);

  const collectionVariablesRef = useRef(collectionVariables);
  useEffect(() => {
    collectionVariablesRef.current = collectionVariables;
  }, [collectionVariables]);

  const addNewEnvironment = useCallback(
    async (newEnvironmentName: string) => {
      return syncRepository.environmentVariablesRepository
        .createNonGlobalEnvironment(newEnvironmentName)
        .then(({ id, name }) => {
          createNewEnvironment({ id, name });
          return {
            id,
            name,
          };
        })
        .catch((err) => {
          notification.error({
            message: "Error while creating a new environment",
            description: err?.message,
            placement: "bottomRight",
          });
          console.error("Error while setting environment in db", err);
        });
    },
    [syncRepository, createNewEnvironment]
  );

  const fetchAndUpdateEnvironments = useCallback(async () => {}, []);

  const forceRefreshEnvironments = useCallback(() => {
    fetchAndUpdateEnvironments();
  }, [fetchAndUpdateEnvironments]);

  // TODO: can be moved into actions
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

  const getVariablesWithPrecedence = useCallback(
    (currentCollectionId: string): Record<string, EnvironmentVariableValue> => {
      const allVariables: Record<string, EnvironmentVariableValue> = {};

      const currentEnvironmentVariables = activeOwnerEnvironments[currentEnvironmentId]?.variables;
      Object.entries(currentEnvironmentVariables || {}).forEach(([key, value]) => {
        // environment variables (highest precedence)
        if (VARIABLES_PRECEDENCE_ORDER[0] === "ENVIRONMENT") {
          allVariables[key] = value;
        } else {
          if (!(key in allVariables)) {
            allVariables[key] = value;
          }
        }
      });

      // Function to get all parent collection variables recursively
      const getParentVariables = (collectionId: string) => {
        const collection = getData(collectionId);
        if (!collection) {
          return;
        }
        // Add current collection's variables
        Object.entries(collectionVariables[collection.id]?.variables || {}).forEach(([key, value]) => {
          // Only add if not already present (maintain precedence) with sub collections
          if (!(key in allVariables)) {
            allVariables[key] = value;
          }
        });

        // Recursively get parent variables
        if (collection.collectionId) {
          getParentVariables(collection.collectionId);
        }
      };

      // Get collection hierarchy variables
      getParentVariables(currentCollectionId);
      const globalEnvId = syncRepository.environmentVariablesRepository.getGlobalEnvironmentId();
      const globalEnvironmentVariables = activeOwnerEnvironments[globalEnvId]?.variables || {};

      Object.entries(globalEnvironmentVariables).forEach(([key, value]) => {
        // global variables (lowest precedence)
        if (!(key in allVariables)) {
          allVariables[key] = value;
        }
      });

      return allVariables;
    },
    [activeOwnerEnvironments, currentEnvironmentId, getData, collectionVariables, syncRepository]
  );

  // TODO: move it in utils
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

  // TODO: move into actions
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

  // TODO: move into actions
  const getEnvironmentVariables = useCallback(
    (environmentId: string): EnvironmentVariables => {
      const env = getEnvironment(environmentId);

      if (!env) {
        throw new Error("Environment not found! ");
      }

      // FIXME: update legacy types to match new store types
      return Object.fromEntries(env.data.variables.getState().getAll());
    },
    [getEnvironment]
  );

  // TODO: move into actions
  const getCurrentEnvironmentVariables = useCallback((): EnvironmentVariables => {
    if (!activeEnvironment?.id) {
      throw new Error("No active environment!");
    }

    return getEnvironmentVariables(activeEnvironment?.id);
  }, [activeEnvironment?.id, getEnvironmentVariables]);

  // TODO: move into actions
  const getGlobalVariables = useCallback((): EnvironmentVariables => {
    return Object.fromEntries(globalEnvironment.data.variables.getState().getAll());
  }, [globalEnvironment]);

  // TODO: move into actions
  const getCurrentCollectionVariables = useCallback(
    (collectionId: string): EnvironmentVariables => {
      const collectionStore = getRecordStore(collectionId);

      if (!collectionStore) {
        throw new Error("Collection not found!");
      }

      return Object.fromEntries(collectionStore.getState().collectionVariables.getState().getAll());
    },
    [getRecordStore]
  );

  // TODO: move into actions
  const getAllEnvironments = useCallback(() => {
    const environments = activeOwnerEnvironments;
    return Object.keys(environments).map((key) => {
      return {
        id: key,
        name: environments[key].name,
      };
    });
  }, [activeOwnerEnvironments]);

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
        console.error("Error while renaming environment", err);
      }
    },
    [updateEnvironment, syncRepository]
  );

  const duplicateEnvironment = useCallback(
    async (environmentId: string) => {
      return syncRepository.environmentVariablesRepository
        .duplicateEnvironment(environmentId, activeOwnerEnvironmentsRef.current)
        .then((newEnvironment) => {
          createNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name });
          getEnvironment(newEnvironment.id)?.data.variables.getState().mergeAndUpdate(newEnvironment.variables);
        });
    },
    [createNewEnvironment, getEnvironment, syncRepository]
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
        console.error("Error while deleting environment", err);
      }
    },
    [removeEnvironment, syncRepository]
  );

  const setCollectionVariables = useCallback(
    async (variables: EnvironmentVariables, collectionId: string) => {
      let collection: RQAPI.CollectionRecord;
      try {
        const existingRecord = getData(collectionId);
        if (!existingRecord) {
          throw new Error("Collection not found");
        }

        if (existingRecord.type !== RQAPI.RecordType.COLLECTION) {
          throw new Error("Record is not a collection");
        }
        collection = existingRecord as RQAPI.CollectionRecord;
      } catch (error) {
        throw new Error("Collection not found");
      }

      const updatedVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          const typeToSave =
            value.type === EnvironmentVariableType.Secret
              ? EnvironmentVariableType.Secret
              : (typeof value.syncValue as EnvironmentVariableType);
          const { localValue, ...rest } = value;
          return [key, { ...rest, type: typeToSave }];
        })
      );
      const record: RQAPI.CollectionRecord = {
        ...collection,
        data: { ...collection?.data, variables: updatedVariables },
      };
      return syncRepository.apiClientRecordsRepository
        .setCollectionVariables(record.id, record.data.variables)
        .then((result) => {
          onSaveRecord(result.data as RQAPI.Record, "open");
          getRecordStore(collectionId)?.getState().collectionVariables.getState().mergeAndUpdate(variables);
        })
        .catch(() => {
          notification.error({
            message: "Error while updating collection variables",
            placement: "bottomRight",
          });
        });
    },
    [onSaveRecord, getRecordStore, syncRepository.apiClientRecordsRepository, getData]
  );

  return {
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironment,
    setVariables,
    renderVariables,
    getEnvironmentVariables,
    getCurrentEnvironmentVariables,
    getAllEnvironments,
    getEnvironmentById,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getVariablesWithPrecedence,
    getGlobalVariables,
    setCollectionVariables,
    getCollectionVariables: getCurrentCollectionVariables,
    environmentSyncRepository: syncRepository.environmentVariablesRepository,
    forceRefreshEnvironments,
  };
};

export default useEnvironmentManager;

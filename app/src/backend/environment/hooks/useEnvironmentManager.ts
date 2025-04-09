import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  EnvironmentMap,
  EnvironmentVariables,
  EnvironmentVariableType,
  EnvironmentVariableValue,
  VariableScope,
} from "../types";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllEnvironmentData,
  getCollectionVariables,
  getCurrentEnvironmentId,
  getErrorEnvFiles,
} from "store/features/variables/selectors";
import { variablesActions } from "store/features/variables/slice";
import { mergeLocalAndSyncVariables, renderTemplate } from "../utils";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { isEmpty } from "lodash";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { useGetApiClientSyncRepo } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

let unsubscribeListener: () => void = null;
let unsubscribeCollectionListener: () => void = null;
let unsubscribeGlobalVariablesListener: () => void = null;

// higher precedence is given to environment variables
const VARIABLES_PRECEDENCE_ORDER = ["ENVIRONMENT", "COLLECTION"];

interface UseEnvironmentManagerOptions {
  initFetchers?: boolean;
}

const useEnvironmentManager = (options: UseEnvironmentManagerOptions = { initFetchers: true }) => {
  const { initFetchers } = options;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const errorEnvFiles = useSelector(getErrorEnvFiles);

  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);
  const collectionVariables = useSelector(getCollectionVariables);

  const ownerId = useMemo(() => (activeWorkspaceId ? `team-${activeWorkspaceId}` : user?.details?.profile?.uid), [
    activeWorkspaceId,
    user?.details?.profile?.uid,
  ]);

  const syncRepository = useGetApiClientSyncRepo();

  const activeOwnerEnvironments = useMemo(() => {
    return allEnvironmentData?.[ownerId] ?? {};
  }, [allEnvironmentData, ownerId]);

  const activeOwnerEnvironmentsRef = useRef(activeOwnerEnvironments);
  useEffect(() => {
    activeOwnerEnvironmentsRef.current = activeOwnerEnvironments;
  }, [activeOwnerEnvironments]);

  const globalEnvironmentData = useMemo(() => {
    const globalEnv = activeOwnerEnvironments[syncRepository.environmentVariablesRepository.getGlobalEnvironmentId()];

    return globalEnv || null;
  }, [activeOwnerEnvironments, syncRepository.environmentVariablesRepository]);

  const collectionVariablesRef = useRef(collectionVariables);
  useEffect(() => {
    collectionVariablesRef.current = collectionVariables;
  }, [collectionVariables]);

  const setCurrentEnvironment = useCallback(
    (environmentId: string) => {
      dispatch(variablesActions.setCurrentEnvironment({ environmentId }));
    },
    [dispatch]
  );

  const addNewEnvironment = useCallback(
    async (newEnvironmentName: string) => {
      return syncRepository.environmentVariablesRepository
        .createNonGlobalEnvironment(newEnvironmentName)
        .then(({ id, name }) => {
          dispatch(variablesActions.addNewEnvironment({ id, name, ownerId }));
          return {
            id,
            name,
          };
        })
        .catch((err) => {
          toast.error("Error while creating a new environment");
          console.error("Error while setting environment in db", err);
        });
    },
    [ownerId, dispatch, syncRepository]
  );

  const attachEnvironmentListener = useCallback(
    (newCurrentEnvironmentId: string) => {
      return syncRepository.environmentVariablesRepository.attachListener({
        scope: VariableScope.ENVIRONMENT,
        id: newCurrentEnvironmentId,
        callback: (environmentData) => {
          const mergedVariables = mergeLocalAndSyncVariables(
            activeOwnerEnvironmentsRef.current[environmentData.id]?.variables ?? {},
            environmentData.variables
          );
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables: mergedVariables,
              environmentId: environmentData.id,
              environmentName: environmentData.name,
              ownerId,
            })
          );
        },
      });
    },
    [dispatch, ownerId, syncRepository.environmentVariablesRepository]
  );

  const attachGlobalVariablesListener = useCallback(() => {
    if (activeOwnerEnvironmentsRef.current?.["global"]?.id) {
      return syncRepository.environmentVariablesRepository.attachListener({
        scope: VariableScope.GLOBAL,
        id: activeOwnerEnvironmentsRef.current?.["global"]?.id,
        callback: (environmentData) => {
          const mergedVariables = mergeLocalAndSyncVariables(
            activeOwnerEnvironmentsRef.current[environmentData.id]?.variables ?? {},
            environmentData.variables
          );
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables: mergedVariables,
              environmentId: environmentData.id,
              environmentName: environmentData.name,
              ownerId,
            })
          );
        },
      });
    }
    return () => {};
  }, [dispatch, ownerId, syncRepository.environmentVariablesRepository]);

  const fetchAndUpdateEnvironments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await syncRepository.environmentVariablesRepository.getAllEnvironments();
      let newCurrentEnvironmentId = currentEnvironmentId;
      if (Object.keys(result.data.environments).length > 0 && !result.data.environments[currentEnvironmentId]) {
        // setting the first environment as the current environment if the current environment is not found in environmentMap
        // do not set global env as active
        newCurrentEnvironmentId = Object.keys(result.data.environments).filter(
          (key) => !isGlobalEnvironment(result.data.environments[key].id)
        )[0];
        setCurrentEnvironment(newCurrentEnvironmentId);
      }

      // Tracking user properties for analytics (excluding global variables)
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ENVIRONMENTS, Object.keys(result.data.environments).length - 1);

      const updatedEnvironmentMap: EnvironmentMap = {};

      if (!isEmpty(activeOwnerEnvironmentsRef.current)) {
        Object.keys(result.data.environments).forEach((key) => {
          updatedEnvironmentMap[key] = {
            ...result.data.environments[key],
            variables: mergeLocalAndSyncVariables(
              activeOwnerEnvironmentsRef.current[key]?.variables ?? {},
              result.data.environments[key].variables
            ),
          };
        });
        dispatch(variablesActions.updateAllEnvironmentData({ environmentMap: updatedEnvironmentMap, ownerId }));
      } else {
        dispatch(variablesActions.updateAllEnvironmentData({ environmentMap: result.data.environments, ownerId }));
      }
      console.log("result.data.errorFiles", result.data.erroredRecords);
      dispatch(variablesActions.setErrorEnvFiles(result.data.erroredRecords));

      if (newCurrentEnvironmentId) {
        unsubscribeListener?.();
        unsubscribeListener = attachEnvironmentListener(newCurrentEnvironmentId);
      }

      // Attach global and collection listeners
      unsubscribeGlobalVariablesListener = attachGlobalVariablesListener();
    } catch (err) {
      console.log("env fetch error", err);
      Logger.log("fetch all env details error", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    attachEnvironmentListener,
    attachGlobalVariablesListener,
    currentEnvironmentId,
    dispatch,
    ownerId,
    setCurrentEnvironment,
    syncRepository.environmentVariablesRepository,
  ]);

  const forceRefreshEnvironments = useCallback(() => {
    fetchAndUpdateEnvironments();
  }, [fetchAndUpdateEnvironments]);

  useEffect(() => {
    if (ownerId && initFetchers) {
      fetchAndUpdateEnvironments();
    }

    return () => {
      unsubscribeListener?.();
      unsubscribeGlobalVariablesListener?.();
    };
  }, [
    attachEnvironmentListener,
    attachGlobalVariablesListener,
    currentEnvironmentId,
    dispatch,
    fetchAndUpdateEnvironments,
    forceRefreshEnvironments,
    initFetchers,
    ownerId,
    setCurrentEnvironment,
    syncRepository.environmentVariablesRepository,
  ]);

  useEffect(() => {
    if (ownerId && initFetchers) {
      unsubscribeCollectionListener?.();
      unsubscribeCollectionListener = syncRepository.environmentVariablesRepository.attachListener({
        scope: VariableScope.COLLECTION,
        callback: (collectionDetails) => {
          Object.keys(collectionDetails).forEach((collectionId) => {
            const mergedCollectionVariables = mergeLocalAndSyncVariables(
              collectionVariablesRef.current[collectionId]?.variables ?? {},
              collectionDetails[collectionId].variables ?? {}
            );
            dispatch(
              variablesActions.updateCollectionVariables({ collectionId, variables: mergedCollectionVariables })
            );
          });
        },
      });
    }

    return () => {
      unsubscribeCollectionListener?.();
    };
  }, [ownerId, initFetchers, dispatch, syncRepository]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(variablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironment = useCallback(() => {
    return {
      currentEnvironmentName: activeOwnerEnvironments[currentEnvironmentId]?.name,
      currentEnvironmentId,
    };
  }, [currentEnvironmentId, activeOwnerEnvironments]);

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
        dispatch(
          variablesActions.updateEnvironmentData({
            newVariables: newVariablesWithSyncvalues,
            environmentId,
            ownerId,
          })
        );
      } catch (err) {
        toast.error("Error while setting environment variables.");
        Logger.error("Error while setting environment variables in db", err);
      }
    },
    [ownerId, dispatch, syncRepository]
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
        const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
        if (!collection) return;

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
    [activeOwnerEnvironments, currentEnvironmentId, apiClientRecords, collectionVariables, syncRepository]
  );

  const renderVariables = useCallback(
    (
      template: RQAPI.Request,
      requestCollectionId: string = ""
    ): {
      renderedVariables?: Record<string, unknown>;
      renderedRequest: RQAPI.Request;
    } => {
      const variablesWithPrecedence = getVariablesWithPrecedence(requestCollectionId);
      const { renderedTemplate, renderedVariables } = renderTemplate(template, variablesWithPrecedence);
      return { renderedVariables, renderedRequest: renderedTemplate as RQAPI.Request };
    },
    [getVariablesWithPrecedence]
  );

  const getEnvironmentVariables = useCallback(
    (environmentId: string): EnvironmentVariables => {
      return activeOwnerEnvironments[environmentId]?.variables ?? {};
    },
    [activeOwnerEnvironments]
  );

  const getCurrentEnvironmentVariables = useCallback((): EnvironmentVariables => {
    return activeOwnerEnvironments[currentEnvironmentId]?.variables ?? {};
  }, [currentEnvironmentId, activeOwnerEnvironments]);

  const getGlobalVariables = useCallback((): EnvironmentVariables => {
    return activeOwnerEnvironments[globalEnvironmentData?.id]?.variables ?? {};
  }, [activeOwnerEnvironments, globalEnvironmentData?.id]);

  const getCurrentCollectionVariables = useCallback(
    (collectionId: string): EnvironmentVariables => {
      return collectionVariables[collectionId]?.variables ?? {};
    },
    [collectionVariables]
  );

  const getAllEnvironments = useCallback(() => {
    const environments = activeOwnerEnvironments;
    return Object.keys(environments).map((key) => {
      return {
        id: key,
        name: environments[key].name,
      };
    });
  }, [activeOwnerEnvironments]);

  const getEnvironmentName = useCallback(
    (environmentId: string) => {
      return activeOwnerEnvironments[environmentId]?.name;
    },
    [activeOwnerEnvironments]
  );

  const renameEnvironment = useCallback(
    async (environmentId: string, newName: string) => {
      try {
        await syncRepository.environmentVariablesRepository.updateEnvironment(environmentId, { name: newName });
        dispatch(variablesActions.updateEnvironmentName({ environmentId, newName, ownerId }));
      } catch (err) {
        toast.error("Error while renaming environment");
        console.error("Error while renaming environment", err);
      }
    },
    [ownerId, dispatch, syncRepository]
  );

  const duplicateEnvironment = useCallback(
    async (environmentId: string) => {
      return syncRepository.environmentVariablesRepository
        .duplicateEnvironment(environmentId, activeOwnerEnvironmentsRef.current)
        .then((newEnvironment) => {
          dispatch(variablesActions.addNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name, ownerId }));
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables: newEnvironment.variables,
              environmentId: newEnvironment.id,
              ownerId,
            })
          );
        });
    },
    [dispatch, ownerId, syncRepository]
  );

  const deleteEnvironment = useCallback(
    async (environmentId: string) => {
      try {
        await syncRepository.environmentVariablesRepository.deleteEnvironment(environmentId);
        dispatch(variablesActions.removeEnvironment({ environmentId, ownerId }));
      } catch (err) {
        toast.error("Error while deleting environment");
        console.error("Error while deleting environment", err);
      }
    },
    [ownerId, dispatch, syncRepository]
  );

  const setCollectionVariables = useCallback(
    async (variables: EnvironmentVariables, collectionId: string) => {
      const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;

      if (!collection) {
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
          dispatch(variablesActions.updateCollectionVariables({ collectionId, variables }));
        })
        .catch(() => {
          toast.error("error while updating collection variables");
        });
    },
    [onSaveRecord, dispatch, syncRepository.apiClientRecordsRepository, apiClientRecords]
  );

  return {
    errorEnvFiles,
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironment,
    setVariables,
    renderVariables,
    getEnvironmentVariables,
    getCurrentEnvironmentVariables,
    getAllEnvironments,
    getEnvironmentName,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getVariablesWithPrecedence,
    isEnvironmentsLoading: isLoading,
    getGlobalVariables,
    setCollectionVariables,
    getCollectionVariables: getCurrentCollectionVariables,
    environmentSyncRepository: syncRepository.environmentVariablesRepository,
    forceRefreshEnvironments,
  };
};

export default useEnvironmentManager;

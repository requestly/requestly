import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { EnvironmentMap, EnvironmentVariables, EnvironmentVariableType, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllEnvironmentData,
  getCollectionVariables,
  getCurrentEnvironmentId,
} from "store/features/variables/selectors";
import { variablesActions } from "store/features/variables/slice";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { mergeLocalAndSyncVariables, renderTemplate } from "../utils";
import {
  attachEnvironmentVariableListener,
  removeEnvironmentVariableFromDB,
  createNonGlobalEnvironmentInDB,
  updateEnvironmentVariablesInDB,
  fetchAllEnvironmentDetails,
  updateEnvironmentNameInDB,
  duplicateEnvironmentInDB,
  deleteEnvironmentFromDB,
  attachCollectionVariableListener,
} from "..";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { isEmpty } from "lodash";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { upsertApiRecord } from "backend/apiClient/upsertApiRecord";

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
  const [isEnvironmentsDataLoaded, setIsEnvironmentsDataLoaded] = useState(false);
  const { apiClientRecords, onSaveRecord } = useApiClientContext();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);
  const collectionVariables = useSelector(getCollectionVariables);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  const activeOwnerEnvironments = useMemo(() => {
    return allEnvironmentData?.[ownerId] ?? {};
  }, [allEnvironmentData, ownerId]);
  const activeOwnerEnvironmentsRef = useRef(activeOwnerEnvironments);
  useEffect(() => {
    activeOwnerEnvironmentsRef.current = activeOwnerEnvironments;
  }, [activeOwnerEnvironments]);

  const globalEnvironmentData = useMemo(() => activeOwnerEnvironments?.["global"] || null, [activeOwnerEnvironments]);

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
      return createNonGlobalEnvironmentInDB(ownerId, newEnvironmentName)
        .then(({ id, name }) => {
          dispatch(variablesActions.addNewEnvironment({ id, name, ownerId }));
          return {
            id,
            name,
          };
        })
        .catch((err) => {
          console.error("Error while setting environment in db", err);
        });
    },
    [ownerId, dispatch]
  );

  useEffect(() => {
    if (ownerId && initFetchers) {
      setIsLoading(true);
      setIsEnvironmentsDataLoaded(false);
      fetchAllEnvironmentDetails(ownerId)
        .then((environmentMap) => {
          if (Object.keys(environmentMap).length > 0 && !environmentMap[currentEnvironmentId]) {
            // setting the first environment as the current environment if the current environment is not found in environmentMap
            // do not set global env as active
            setCurrentEnvironment(
              Object.keys(environmentMap).filter((key) => !isGlobalEnvironment(environmentMap[key].id))[0]
            );
          }

          const updatedEnvironmentMap: EnvironmentMap = {};

          if (!isEmpty(activeOwnerEnvironmentsRef.current)) {
            Object.keys(environmentMap).forEach((key) => {
              updatedEnvironmentMap[key] = {
                ...environmentMap[key],
                variables: mergeLocalAndSyncVariables(
                  activeOwnerEnvironmentsRef.current[key]?.variables ?? {},
                  environmentMap[key].variables
                ),
              };
            });
            dispatch(variablesActions.updateAllEnvironmentData({ environmentMap: updatedEnvironmentMap, ownerId }));
          } else {
            dispatch(variablesActions.updateAllEnvironmentData({ environmentMap, ownerId }));
          }
        })
        .catch((err) => {
          Logger.log("fetch all env details error", err);
        })
        .finally(() => {
          setIsLoading(false);
          setIsEnvironmentsDataLoaded(true);
        });
    }
  }, [currentEnvironmentId, dispatch, initFetchers, ownerId, setCurrentEnvironment]);

  useEffect(() => {
    if (ownerId && currentEnvironmentId && initFetchers) {
      unsubscribeListener?.();
      unsubscribeListener = attachEnvironmentVariableListener(ownerId, currentEnvironmentId, (environmentData) => {
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
        setIsEnvironmentsDataLoaded(true);
      });
    }

    return () => {
      unsubscribeListener?.();
    };
  }, [currentEnvironmentId, dispatch, initFetchers, ownerId]);

  useEffect(() => {
    if (ownerId && activeOwnerEnvironmentsRef.current?.["global"]?.id && initFetchers) {
      unsubscribeGlobalVariablesListener?.();
      unsubscribeGlobalVariablesListener = attachEnvironmentVariableListener(
        ownerId,
        activeOwnerEnvironmentsRef.current?.["global"]?.id,
        (environmentData) => {
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
        }
      );
    }

    return () => {
      unsubscribeGlobalVariablesListener?.();
    };
  }, [ownerId, initFetchers, dispatch]);

  useEffect(() => {
    if (ownerId && initFetchers) {
      unsubscribeCollectionListener?.();
      unsubscribeCollectionListener = attachCollectionVariableListener(ownerId, (collectionDetails) => {
        Object.keys(collectionDetails).forEach((collectionId) => {
          const mergedCollectionVariables = mergeLocalAndSyncVariables(
            collectionVariablesRef.current[collectionId]?.variables ?? {},
            collectionDetails[collectionId].variables ?? {}
          );
          dispatch(variablesActions.setCollectionVariables({ collectionId, variables: mergedCollectionVariables }));
        });
      });
    }

    return () => {
      unsubscribeCollectionListener?.();
    };
  }, [ownerId, initFetchers, dispatch]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(variablesActions.resetState());
      setIsEnvironmentsDataLoaded(false);
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
            { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB, id: value.id },
          ];
        })
      );

      return updateEnvironmentVariablesInDB(ownerId, environmentId, newVariablesWithSyncvalues)
        .then(() => {
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables: newVariablesWithSyncvalues,
              environmentId,
              ownerId,
            })
          );
        })
        .catch((err) => {
          toast.error("Error while setting environment variables.");
          Logger.error("Error while setting environment variables in db", err);
          console.error("Error while setting environment variables in db", err);
        });
    },
    [ownerId, dispatch]
  );

  const removeVariable = useCallback(
    async (environmentId: string, key: string) => {
      return removeEnvironmentVariableFromDB(ownerId, { environmentId, key })
        .then(() => {
          dispatch(variablesActions.removeVariableFromEnvironment({ key, environmentId, ownerId }));
        })
        .catch((err) => {
          toast.error("Error while removing environment variables.");
          Logger.error("Error while removing environment variables from db", err);
          console.error("Error while removing environment variables from db", err);
        });
    },
    [ownerId, dispatch]
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

      const globalEnvironmentVariables = activeOwnerEnvironments["global"]?.variables || {};

      Object.entries(globalEnvironmentVariables).forEach(([key, value]) => {
        // global variables (lowest precedence)
        if (!(key in allVariables)) {
          allVariables[key] = value;
        }
      });

      return allVariables;
    },
    [activeOwnerEnvironments, currentEnvironmentId, apiClientRecords, collectionVariables]
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
      return updateEnvironmentNameInDB(ownerId, environmentId, newName).then(() => {
        dispatch(variablesActions.updateEnvironmentName({ environmentId, newName, ownerId }));
      });
    },
    [ownerId, dispatch]
  );

  const duplicateEnvironment = useCallback(
    async (environmentId: string) => {
      return duplicateEnvironmentInDB(ownerId, environmentId, activeOwnerEnvironmentsRef.current).then(
        (newEnvironment) => {
          dispatch(variablesActions.addNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name, ownerId }));
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables: newEnvironment.variables,
              environmentId: newEnvironment.id,
              ownerId,
            })
          );
        }
      );
    },
    [dispatch, ownerId]
  );

  const deleteEnvironment = useCallback(
    async (environmentId: string) => {
      return deleteEnvironmentFromDB(ownerId, environmentId).then(() => {
        dispatch(variablesActions.removeEnvironment({ environmentId, ownerId }));
      });
    },
    [ownerId, dispatch]
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
      return upsertApiRecord(user.details?.profile?.uid, record, currentlyActiveWorkspace?.id).then((result) => {
        onSaveRecord(result.data);
        dispatch(variablesActions.setCollectionVariables({ collectionId, variables }));
      });
    },
    [currentlyActiveWorkspace?.id, user.details?.profile?.uid, onSaveRecord, dispatch, apiClientRecords]
  );

  const removeCollectionVariable = useCallback(
    async (key: string, collectionId: string) => {
      const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;

      if (!collection) {
        throw new Error("Collection not found");
      }

      const updatedVariables = { ...collection?.data?.variables };
      delete updatedVariables[key];
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
      return upsertApiRecord(user.details?.profile?.uid, record, currentlyActiveWorkspace?.id).then((result) => {
        onSaveRecord(result.data);
        dispatch(variablesActions.setCollectionVariables({ collectionId, variables: updatedVariables }));
      });
    },
    [currentlyActiveWorkspace?.id, user.details?.profile?.uid, onSaveRecord, dispatch, apiClientRecords]
  );

  return {
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironment,
    setVariables,
    removeVariable,
    renderVariables,
    getEnvironmentVariables,
    getCurrentEnvironmentVariables,
    getAllEnvironments,
    getEnvironmentName,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getVariablesWithPrecedence,
    isEnvironmentsDataLoaded,
    isEnvironmentsLoading: isLoading,
    getGlobalVariables,
    setCollectionVariables,
    removeCollectionVariable,
    getCollectionVariables: getCurrentCollectionVariables,
  };
};

export default useEnvironmentManager;

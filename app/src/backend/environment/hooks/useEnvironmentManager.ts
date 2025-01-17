import { useEffect, useMemo, useCallback, useState } from "react";
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
  upsertEnvironmentInDB,
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

const useEnvironmentManager = (options = { enableEffects: true }) => {
  const { enableEffects = true } = options;
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

  const globalEnvironmentData = useMemo(() => activeOwnerEnvironments?.["global"] || null, [activeOwnerEnvironments]);

  const setCurrentEnvironment = useCallback(
    (environmentId: string) => {
      dispatch(variablesActions.setCurrentEnvironment({ environmentId }));
    },
    [dispatch]
  );

  const addNewEnvironment = useCallback(
    async (newEnvironmentName: string, isGlobal = false) => {
      if (globalEnvironmentData?.id && isGlobal) {
        throw new Error("Global environment already exists");
      }
      const docId = isGlobal ? "global" : undefined;
      return upsertEnvironmentInDB(ownerId, newEnvironmentName, docId)
        .then(({ id, name }) => {
          dispatch(variablesActions.addNewEnvironment({ id, name, ownerId }));
          return {
            id,
            name,
            isGlobal,
          };
        })
        .catch((err) => {
          console.error("Error while setting environment in db", err);
        });
    },
    [globalEnvironmentData?.id, ownerId, dispatch]
  );

  useEffect(() => {
    if (ownerId && enableEffects) {
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

          if (!isEmpty(allEnvironmentData)) {
            Object.keys(environmentMap).forEach((key) => {
              updatedEnvironmentMap[key] = {
                ...environmentMap[key],
                ...allEnvironmentData[key],
                variables: mergeLocalAndSyncVariables(
                  activeOwnerEnvironments[key]?.variables ?? {},
                  environmentMap[key].variables
                ),
              };
            });
            dispatch(variablesActions.setAllEnvironmentData({ environmentMap: updatedEnvironmentMap, ownerId }));
          } else {
            dispatch(variablesActions.setAllEnvironmentData({ environmentMap, ownerId }));
          }
        })
        .catch((err) => {
          Logger.error("Error while fetching all environment variables", err);
          dispatch(variablesActions.setAllEnvironmentData({ environmentMap: {}, ownerId }));
        })
        .finally(() => {
          setIsLoading(false);
          setIsEnvironmentsDataLoaded(true);
        });
    }
    // }
    // Disabled otherwise infinite loop if allEnvironmentData is included here, allEnvironmentData should be fetched only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, dispatch, addNewEnvironment, setCurrentEnvironment, currentEnvironmentId, enableEffects]);

  useEffect(() => {
    if (ownerId && currentEnvironmentId && enableEffects) {
      unsubscribeListener?.();
      unsubscribeListener = attachEnvironmentVariableListener(ownerId, currentEnvironmentId, (environmentData) => {
        const mergedVariables = mergeLocalAndSyncVariables(
          activeOwnerEnvironments[environmentData.id]?.variables ?? {},
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

    // Disabled otherwise infinite loop if allEnvironmentData is included here, listener should be attached once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnvironmentId, dispatch, ownerId, enableEffects]);

  useEffect(() => {
    if (ownerId && globalEnvironmentData?.id && enableEffects) {
      unsubscribeGlobalVariablesListener?.();
      unsubscribeGlobalVariablesListener = attachEnvironmentVariableListener(
        ownerId,
        globalEnvironmentData.id,
        (environmentData) => {
          const mergedVariables = mergeLocalAndSyncVariables(
            activeOwnerEnvironments[environmentData.id]?.variables ?? {},
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

    // Disabled otherwise infinite loop if allEnvironmentData is included here, listener should be attached once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalEnvironmentData?.id, ownerId, enableEffects]);

  useEffect(() => {
    if (ownerId && enableEffects) {
      unsubscribeCollectionListener?.();
      unsubscribeCollectionListener = attachCollectionVariableListener(ownerId, (collectionDetails) => {
        Object.keys(collectionDetails).forEach((collectionId) => {
          const mergedCollectionVariables = mergeLocalAndSyncVariables(
            collectionVariables[collectionId]?.variables ?? {},
            collectionDetails[collectionId].variables ?? {}
          );
          dispatch(variablesActions.setCollectionVariables({ collectionId, variables: mergedCollectionVariables }));
        });
      });
    }

    return () => {
      unsubscribeCollectionListener?.();
    };
    // Disabled otherwise infinite loop if allEnvironmentData is included here, listener should be attached once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, enableEffects]);

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
        Object.entries(variables).map(([key, value]) => {
          const typeToSaveInDB =
            value.type === EnvironmentVariableType.Secret ? EnvironmentVariableType.Secret : typeof value.syncValue;
          return [key.trim(), { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB }];
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
    (template: string | Record<string, any>, requestCollectionId: string = "") => {
      const variablesWithPrecedence = getVariablesWithPrecedence(requestCollectionId);
      const renderedTemplate = renderTemplate(template, variablesWithPrecedence);

      return {
        renderedTemplate,
        variables: variablesWithPrecedence,
      };
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

  const getVariableData = useCallback(
    (variableKey: string) => {
      if (activeOwnerEnvironments[currentEnvironmentId].variables[variableKey]) {
        return {
          ...activeOwnerEnvironments[currentEnvironmentId].variables[variableKey],
          key: variableKey,
        };
      }
      return null;
    },
    [currentEnvironmentId, activeOwnerEnvironments]
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
      return duplicateEnvironmentInDB(ownerId, environmentId, activeOwnerEnvironments).then((newEnvironment) => {
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
    [dispatch, activeOwnerEnvironments, ownerId]
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
            value.type === EnvironmentVariableType.Secret ? EnvironmentVariableType.Secret : typeof value.syncValue;
          const { localValue, ...rest } = value;
          return [key, { ...rest, type: typeToSave }];
        })
      );
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
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
    getVariableData,
    renameEnvironment,
    duplicateEnvironment,
    deleteEnvironment,
    getVariablesWithPrecedence,
    isEnvironmentsDataLoaded,
    isEnvironmentsLoading: isLoading,
    getGlobalVariables,
    setCollectionVariables,
    removeCollectionVariable,
  };
};

export default useEnvironmentManager;

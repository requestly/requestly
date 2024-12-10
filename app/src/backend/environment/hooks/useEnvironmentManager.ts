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

let unsubscribeListener: () => void = null;
let unsubscribeCollectionListener: () => void = null;

// higher precedence is given to environment variables
const VARIABLES_PRECEDENCE_ORDER = ["ENVIRONMENT", "COLLECTION"];

const useEnvironmentManager = (initListenerAndFetcher: boolean = false) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { apiClientRecords } = useApiClientContext();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);
  const collectionVariables = useSelector(getCollectionVariables);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  const setCurrentEnvironment = useCallback(
    (environmentId: string) => {
      dispatch(variablesActions.setCurrentEnvironment({ environmentId }));
    },
    [dispatch]
  );

  const addNewEnvironment = useCallback(
    async (newEnvironment: string) => {
      return upsertEnvironmentInDB(ownerId, newEnvironment)
        .then(({ id, name }) => {
          dispatch(variablesActions.addNewEnvironment({ id, name }));
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
    if (initListenerAndFetcher) {
      setIsLoading(true);
      fetchAllEnvironmentDetails(ownerId)
        .then((environmentMap) => {
          if (Object.keys(environmentMap).length > 0 && !environmentMap[currentEnvironmentId]) {
            // setting the first environment as the current environment if the current environment is not found in environmentMap
            setCurrentEnvironment(Object.keys(environmentMap)[0]);
          }

          const updatedEnvironmentMap: EnvironmentMap = {};

          if (!isEmpty(allEnvironmentData)) {
            Object.keys(environmentMap).forEach((key) => {
              updatedEnvironmentMap[key] = {
                ...environmentMap[key],
                ...allEnvironmentData[key],
                variables: mergeLocalAndSyncVariables(
                  allEnvironmentData[key]?.variables ?? {},
                  environmentMap[key].variables
                ),
              };
            });
            dispatch(variablesActions.setAllEnvironmentData({ environmentMap: updatedEnvironmentMap }));
          } else dispatch(variablesActions.setAllEnvironmentData({ environmentMap }));
        })
        .catch((err) => {
          Logger.error("Error while fetching all environment variables", err);
          dispatch(variablesActions.setAllEnvironmentData({ environmentMap: {} }));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // Disabled otherwise infinite loop if allEnvironmentData is included here, allEnvironmentData should be fetched only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, dispatch, addNewEnvironment, setCurrentEnvironment, initListenerAndFetcher, currentEnvironmentId]);

  useEffect(() => {
    if (ownerId && currentEnvironmentId && initListenerAndFetcher) {
      unsubscribeListener?.();
      unsubscribeListener = attachEnvironmentVariableListener(ownerId, currentEnvironmentId, (environmentData) => {
        const mergedVariables = mergeLocalAndSyncVariables(
          allEnvironmentData[environmentData.id]?.variables ?? {},
          environmentData.variables
        );
        dispatch(
          variablesActions.updateEnvironmentData({
            newVariables: mergedVariables,
            environmentId: environmentData.id,
            environmentName: environmentData.name,
          })
        );
      });
    }

    return () => {
      unsubscribeListener?.();
    };

    // Disabled otherwise infinite loop if allEnvironmentData is included here, listener should be attached once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnvironmentId, dispatch, initListenerAndFetcher, ownerId]);

  useEffect(() => {
    if (ownerId) {
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
  }, [ownerId, dispatch]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(variablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironment = useCallback(() => {
    return {
      currentEnvironmentName: allEnvironmentData[currentEnvironmentId]?.name,
      currentEnvironmentId,
    };
  }, [allEnvironmentData, currentEnvironmentId]);

  const setVariables = useCallback(
    async (environmentId: string, variables: EnvironmentVariables) => {
      const newVariables: EnvironmentVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          const typeToSaveInDB =
            value.type === EnvironmentVariableType.Secret ? EnvironmentVariableType.Secret : typeof value.syncValue;
          return [key, { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB }];
        })
      );

      return updateEnvironmentVariablesInDB(ownerId, environmentId, newVariables)
        .then(() => {
          dispatch(
            variablesActions.updateEnvironmentData({
              newVariables,
              environmentId,
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
          dispatch(variablesActions.removeVariableFromEnvironment({ key, environmentId }));
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

      // Function to get all parent collection variables recursively
      const getParentVariables = (collectionId: string) => {
        const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
        if (!collection) return;

        // Add current collection's variables
        Object.entries(collectionVariables[collection.id]?.variables || {}).forEach(([key, value]) => {
          // Only add if not already present (maintain precedence)
          if (!(key in allVariables)) {
            allVariables[key] = value;
          }
        });

        // Recursively get parent variables
        if (collection.collectionId) {
          getParentVariables(collection.collectionId);
        }
      };

      const currentEnvironmentVariables = allEnvironmentData[currentEnvironmentId]?.variables;
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

      // Get collection hierarchy variables
      getParentVariables(currentCollectionId);

      return allVariables;
    },
    [allEnvironmentData, apiClientRecords, currentEnvironmentId, collectionVariables]
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
    (environmentId: string) => {
      return allEnvironmentData[environmentId]?.variables ?? {};
    },
    [allEnvironmentData]
  );

  const getCurrentEnvironmentVariables = useCallback(() => {
    return allEnvironmentData[currentEnvironmentId]?.variables ?? {};
  }, [allEnvironmentData, currentEnvironmentId]);

  const getAllEnvironments = useCallback(() => {
    return Object.keys(allEnvironmentData).map((key) => {
      return {
        id: key,
        name: allEnvironmentData[key].name,
      };
    });
  }, [allEnvironmentData]);

  const getEnvironmentName = useCallback(
    (environmentId: string) => {
      return allEnvironmentData[environmentId]?.name;
    },
    [allEnvironmentData]
  );

  const getVariableData = useCallback(
    (variableKey: string) => {
      if (allEnvironmentData[currentEnvironmentId].variables[variableKey]) {
        return {
          ...allEnvironmentData[currentEnvironmentId].variables[variableKey],
          key: variableKey,
        };
      }
      return null;
    },
    [allEnvironmentData, currentEnvironmentId]
  );

  const renameEnvironment = useCallback(
    async (environmentId: string, newName: string) => {
      return updateEnvironmentNameInDB(ownerId, environmentId, newName).then(() => {
        dispatch(variablesActions.updateEnvironmentName({ environmentId, newName }));
      });
    },
    [ownerId, dispatch]
  );

  const duplicateEnvironment = useCallback(
    async (environmentId: string) => {
      return duplicateEnvironmentInDB(ownerId, environmentId, allEnvironmentData).then((newEnvironment) => {
        dispatch(variablesActions.addNewEnvironment({ id: newEnvironment.id, name: newEnvironment.name }));
        dispatch(
          variablesActions.updateEnvironmentData({
            newVariables: newEnvironment.variables,
            environmentId: newEnvironment.id,
          })
        );
      });
    },
    [allEnvironmentData, dispatch, ownerId]
  );

  const deleteEnvironment = useCallback(
    async (environmentId: string) => {
      return deleteEnvironmentFromDB(ownerId, environmentId).then(() => {
        dispatch(variablesActions.removeEnvironment({ environmentId }));
      });
    },
    [ownerId, dispatch]
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
    isEnvironmentsLoading: isLoading,
  };
};

export default useEnvironmentManager;

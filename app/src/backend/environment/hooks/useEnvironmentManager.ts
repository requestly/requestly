import { useEffect, useMemo, useCallback, useState } from "react";
import { EnvironmentMap, EnvironmentVariables, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentData, getCurrentEnvironmentId } from "store/features/environment/selectors";
import { environmentVariablesActions } from "store/features/environment/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { mergeLocalAndSyncVariables, renderTemplate } from "../utils";
import {
  attachEnvironmentVariableListener,
  removeEnvironmentVariableFromDB,
  upsertEnvironmentInDB,
  updateEnvironmentVariablesInDB,
  fetchAllEnvironmentDetails,
  updateEnvironmentNameInDB,
} from "..";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { isEmpty } from "lodash";

let unsubscribeListener: () => void = null;

const useEnvironmentManager = (initListenerAndFetcher: boolean = true) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  const setCurrentEnvironment = useCallback(
    (environmentId: string) => {
      dispatch(environmentVariablesActions.setCurrentEnvironment({ environmentId }));
    },
    [dispatch]
  );

  const addNewEnvironment = useCallback(
    async (newEnvironment: string) => {
      return upsertEnvironmentInDB(ownerId, newEnvironment)
        .then(({ id, name }) => {
          dispatch(environmentVariablesActions.addNewEnvironment({ id, name }));
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
          console.log("environmentMap", environmentMap);
          if (Object.keys(environmentMap).length > 0 && !environmentMap[currentEnvironmentId]) {
            // setting the first environment as the current environment if the current environment is not found in environmentMap
            setCurrentEnvironment(Object.keys(environmentMap)[0]);
          }

          const updatedEnvironmentMap: EnvironmentMap = {};

          if (!isEmpty(allEnvironmentData)) {
            Object.keys(environmentMap).forEach((key) => {
              updatedEnvironmentMap[key] = {
                ...allEnvironmentData[key],
                variables: mergeLocalAndSyncVariables(
                  allEnvironmentData[key]?.variables ?? {},
                  environmentMap[key].variables
                ),
              };
            });
            dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap: updatedEnvironmentMap }));
          } else dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap }));
        })
        .catch((err) => {
          Logger.error("Error while fetching all environment variables", err);
          dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap: {} }));
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
        console.log("environmentData", environmentData);
        const mergedVariables = mergeLocalAndSyncVariables(
          allEnvironmentData[environmentData.id]?.variables ?? {},
          environmentData.variables
        );
        dispatch(
          environmentVariablesActions.updateEnvironmentData({
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
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(environmentVariablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironment = useCallback(() => {
    return {
      currentEnvironmentName: allEnvironmentData[currentEnvironmentId]?.name,
      currentEnvironmentId,
    };
  }, [allEnvironmentData, currentEnvironmentId]);

  const setVariables = useCallback(
    async (environmentId: string, variables: Record<string, Omit<EnvironmentVariableValue, "type">>) => {
      const newVariables: EnvironmentVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          return [key, { localValue: value.localValue, syncValue: value.syncValue, type: typeof value.syncValue }];
        })
      );

      return updateEnvironmentVariablesInDB(ownerId, environmentId, newVariables)
        .then(() => {
          dispatch(
            environmentVariablesActions.updateEnvironmentData({
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
          dispatch(environmentVariablesActions.removeVariableFromEnvironment({ key, environmentId }));
        })
        .catch((err) => {
          toast.error("Error while removing environment variables.");
          Logger.error("Error while removing environment variables from db", err);
          console.error("Error while removing environment variables from db", err);
        });
    },
    [ownerId, dispatch]
  );

  const renderVariables = useCallback(
    <T>(template: string | Record<string, any>): T => {
      const currentEnvironmentVariables = allEnvironmentData[currentEnvironmentId]?.variables;
      return renderTemplate(template, currentEnvironmentVariables);
    },
    [allEnvironmentData, currentEnvironmentId]
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

  const renameEnvironment = useCallback(
    async (environmentId: string, newName: string) => {
      return updateEnvironmentNameInDB(ownerId, environmentId, newName);
    },
    [ownerId]
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
    isEnvironmentsLoading: isLoading,
  };
};

export default useEnvironmentManager;

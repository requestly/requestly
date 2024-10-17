import { useEffect, useMemo, useCallback, useState } from "react";
import { EnvironmentVariables, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentData, getCurrentEnvironmentId } from "store/features/environment/selectors";
import { environmentVariablesActions } from "store/features/environment/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { renderTemplate } from "../utils";
import {
  attachEnvironmentVariableListener,
  removeEnvironmentVariableFromDB,
  upsertEnvironmentInDB,
  updateEnvironmentVariablesInDB,
  fetchAllEnvironmentDetails,
} from "..";
import Logger from "lib/logger";
import { toast } from "utils/Toast";

let unsubscribeListener: () => void = null;

const useEnvironmentManager = (initListenerAndFetcher: boolean = false) => {
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
      return upsertEnvironmentInDB(ownerId, newEnvironment).catch((err) => {
        console.error("Error while setting environment in db", err);
      });
    },
    [ownerId]
  );

  useEffect(() => {
    if (initListenerAndFetcher) {
      setIsLoading(true);
      fetchAllEnvironmentDetails(ownerId)
        .then((environmentMap) => {
          dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap }));

          if (Object.keys(environmentMap).length === 0) {
            addNewEnvironment("Default").then((defaultEnv) => {
              if (defaultEnv) {
                setCurrentEnvironment(defaultEnv.id);
              }
            });
          } else {
            const defaultEnvironment = Object.keys(environmentMap)[0];
            setCurrentEnvironment(defaultEnvironment);
          }
        })
        .catch((err) => {
          console.log("Error while fetching all environment variables", err);
          Logger.error("Error while fetching all environment variables", err);
          dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap: {} }));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [ownerId, dispatch, addNewEnvironment, setCurrentEnvironment, initListenerAndFetcher]);

  useEffect(() => {
    unsubscribeListener?.();
    if (ownerId && currentEnvironmentId && initListenerAndFetcher) {
      unsubscribeListener = attachEnvironmentVariableListener(ownerId, currentEnvironmentId, (environmentData) => {
        dispatch(
          environmentVariablesActions.setVariablesInEnvironment({
            newVariables: environmentData.variables,
            environmentId: environmentData.id,
          })
        );
      });
    }

    return () => {
      unsubscribeListener?.();
    };
  }, [currentEnvironmentId, dispatch, ownerId, initListenerAndFetcher]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(environmentVariablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironment = () => {
    return {
      currentEnvironmentName: allEnvironmentData[currentEnvironmentId]?.name,
      currentEnvironmentId,
    };
  };

  const setVariables = async (
    environmentId: string,
    variables: Record<string, Omit<EnvironmentVariableValue, "type">>
  ) => {
    const newVariables: EnvironmentVariables = Object.fromEntries(
      Object.entries(variables).map(([key, value]) => {
        return [key, { localValue: value.localValue, syncValue: value.syncValue, type: typeof value.syncValue }];
      })
    );

    return updateEnvironmentVariablesInDB(ownerId, environmentId, newVariables)
      .then(() => {
        dispatch(
          environmentVariablesActions.setVariablesInEnvironment({
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
  };

  const removeVariable = async (environmentId: string, key: string) => {
    return removeEnvironmentVariableFromDB(ownerId, { environmentId, key })
      .then(() => {
        dispatch(environmentVariablesActions.removeVariableFromEnvironment({ key, environmentId }));
      })
      .catch((err) => {
        toast.error("Error while removing environment variables.");
        Logger.error("Error while removing environment variables from db", err);
        console.error("Error while removing environment variables from db", err);
      });
  };

  const renderVariables = <T>(template: string | Record<string, any>): T => {
    const currentEnvironmentVariables = allEnvironmentData[currentEnvironmentId].variables;
    return renderTemplate(template, currentEnvironmentVariables);
  };

  const getCurrentEnvironmentVariables = () => {
    return allEnvironmentData[currentEnvironmentId]?.variables ?? {};
  };

  const getAllEnvironments = () => {
    return Object.keys(allEnvironmentData).map((key) => {
      return {
        id: key,
        name: allEnvironmentData[key].name,
      };
    });
  };

  const getEnvironmentVariables = (environment: string) => {
    return allEnvironmentData[environment]?.variables;
  };

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
    isEnvironmentsLoading: isLoading,
  };
};

export default useEnvironmentManager;

import { useEffect, useMemo, useCallback } from "react";
import { EnvironmentVariables, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentData, getCurrentEnvironmentDetails } from "store/features/environment/selectors";
import { environmentVariablesActions } from "store/features/environment/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { renderTemplate } from "../utils";
import {
  attatchEnvironmentVariableListener,
  removeEnvironmentVariableFromDB,
  setEnvironmentInDB,
  setEnvironmentVariablesInDB,
} from "..";
import Logger from "lib/logger";
import { toast } from "utils/Toast";

let unsubscribeListener: () => void = null;

const useEnvironmentManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { name: currentEnvironmentName, id: currentEnvironmentId } = useSelector(getCurrentEnvironmentDetails);
  const allEnvironmentData = useSelector(getAllEnvironmentData);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  const addNewEnvironment = useCallback(
    async (newEnvironment: string) => {
      return setEnvironmentInDB(ownerId, newEnvironment)
        .then((res) => res)
        .catch((err) => {
          Logger.error("Error while setting environment in db", err);
        });
    },
    [ownerId]
  );

  const setCurrentEnvironment = useCallback(
    (newEnvironment: string) => {
      dispatch(environmentVariablesActions.setEnvironment({ environmentName: newEnvironment }));
    },
    [dispatch]
  );

  useEffect(() => {
    unsubscribeListener?.();
    unsubscribeListener = attatchEnvironmentVariableListener(ownerId, (environmentMap) => {
      dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap }));

      // Check if no environments exist, create a default one
      if (Object.keys(environmentMap).length === 0) {
        addNewEnvironment("default").then((defaultEnv) => {
          if (defaultEnv) {
            setCurrentEnvironment(defaultEnv.id);
          }
        });
      }
    });

    return () => {
      unsubscribeListener();
    };
  }, [dispatch, ownerId, addNewEnvironment, setCurrentEnvironment]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(environmentVariablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironment = () => {
    return {
      currentEnvironmentName: currentEnvironmentName || "default",
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

    return setEnvironmentVariablesInDB(ownerId, {
      newVariables,
      environmentId,
    })
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

  const renderString = <T>(template: string | Record<string, any>): T => {
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
    renderString,
    getEnvironmentVariables,
    getCurrentEnvironmentVariables,
    getAllEnvironments,
  };
};

export default useEnvironmentManager;

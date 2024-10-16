import { useEffect, useMemo } from "react";
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
  const { name: currentEnvironmentName } = useSelector(getCurrentEnvironmentDetails);
  const allEnvironmentData = useSelector(getAllEnvironmentData);
  const currentEnvironmentVariables = allEnvironmentData[currentEnvironmentName]?.variables ?? {};

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  useEffect(() => {
    unsubscribeListener?.();
    unsubscribeListener = attatchEnvironmentVariableListener(ownerId, (environmentMap) => {
      dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap }));
    });

    return () => {
      unsubscribeListener();
    };
  }, [dispatch, currentEnvironmentName, ownerId]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(environmentVariablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

  const getCurrentEnvironmentName = () => {
    return currentEnvironmentName;
  };

  const addNewEnvironment = async (newEnvironment: string) => {
    return setEnvironmentInDB(ownerId, newEnvironment).catch((err) => {
      console.error("Error while setting environment in db", err);
    });
  };

  const setCurrentEnvironment = (newEnvironment: string) => {
    dispatch(environmentVariablesActions.setEnvironment({ environmentName: newEnvironment }));
  };

  const setVariables = async (variables: Record<string, Omit<EnvironmentVariableValue, "type">>) => {
    const newVariables: EnvironmentVariables = Object.fromEntries(
      Object.entries(variables).map(([key, value]) => {
        return [key, { localValue: value.localValue, syncValue: value.syncValue, type: typeof value.syncValue }];
      })
    );

    return setEnvironmentVariablesInDB(ownerId, {
      newVariables,
      environment: currentEnvironmentName,
    })
      .then(() => {
        dispatch(
          environmentVariablesActions.setVariablesInEnvironment({
            newVariables,
            environment: currentEnvironmentName,
          })
        );
      })
      .catch((err) => {
        toast.error("Error while setting environment variables.");
        Logger.error("Error while setting environment variables in db", err);
        console.error("Error while setting environment variables in db", err);
      });
  };

  const removeVariable = async (key: string) => {
    return removeEnvironmentVariableFromDB(ownerId, { environment: currentEnvironmentName, key })
      .then(() => {
        dispatch(
          environmentVariablesActions.removeVariableFromEnvironment({ key, environment: currentEnvironmentName })
        );
      })
      .catch((err) => {
        toast.error("Error while removing environment variables.");
        Logger.error("Error while removing environment variables from db", err);
        console.error("Error while removing environment variables from db", err);
      });
  };

  const renderString = <T>(template: string | Record<string, any>): T => {
    return renderTemplate(template, currentEnvironmentVariables);
  };

  const getVariableValue = (key: string) => {
    return currentEnvironmentVariables?.[key];
  };

  const getCurrentEnvironmentVariables = () => {
    return currentEnvironmentVariables;
  };

  return {
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironmentName,
    setVariables,
    removeVariable,
    renderString,
    getVariableValue,
    getCurrentEnvironmentVariables,
  };
};

export default useEnvironmentManager;

import { useEffect, useMemo } from "react";
import { EnvironmentVariable, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentVariables, getCurrentEnvironmentDetails } from "store/features/environment/selectors";
import { environmentVariablesActions } from "store/features/environment/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  attatchEnvironmentVariableListener,
  removeEnvironmentVariableFromDB,
  setEnvironmentInDB,
  setEnvironmentVariablesInDB,
} from "..";
import Logger from "lib/logger";

let unsubscribeListener: () => void = null;

const useEnvironmentManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const variables = useSelector(getAllEnvironmentVariables);
  const { name: currentEnvironmentName } = useSelector(getCurrentEnvironmentDetails);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  useEffect(() => {
    unsubscribeListener?.();
    unsubscribeListener = attatchEnvironmentVariableListener(ownerId, currentEnvironmentName, (newVariables) => {
      dispatch(environmentVariablesActions.setVariables({ newVariables }));
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

  const setVariable = async (key: string, value: Omit<EnvironmentVariableValue, "type">) => {
    const newVariable: EnvironmentVariable = {
      [key]: {
        localValue: value.localValue,
        syncValue: value.syncValue,
        type: typeof value.syncValue,
      },
    };

    return setEnvironmentVariablesInDB(ownerId, {
      newVariables: newVariable,
      environment: currentEnvironmentName,
    })
      .then(() => {
        dispatch(environmentVariablesActions.setVariables({ newVariables: newVariable }));
      })
      .catch((err) => {
        console.error("Error while setting environment variables in db", err);
      });
  };

  const getVariableValue = (key: string) => {
    return variables?.[key];
  };

  const getAllVariables = () => {
    return variables;
  };

  const removeVariable = async (key: string) => {
    return removeEnvironmentVariableFromDB(ownerId, { environment: currentEnvironmentName, key })
      .then(() => {
        dispatch(environmentVariablesActions.removeVariable({ key }));
      })
      .catch((err) => {
        console.error("Error while removing environment variables from db", err);
      });
  };

  return {
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironmentName,
    setVariable,
    getVariableValue,
    getAllVariables,
    removeVariable,
  };
};

export default useEnvironmentManager;

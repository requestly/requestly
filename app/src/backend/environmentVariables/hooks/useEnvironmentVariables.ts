import { useEffect, useMemo, useState } from "react";
import { EnvironmentVariable, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentVariables } from "store/features/environmentVariables/selectors";
import { environmentVariablesActions } from "store/features/environmentVariables/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { attatchEnvironmentVariableListener, removeEnvironmentVariableFromDB, setEnvironmentVariablesInDB } from "..";
import Logger from "lib/logger";

const useEnvironmentVariables = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const variables = useSelector(getAllEnvironmentVariables);

  const [environment, setEnvironment] = useState<string>("default");

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  useEffect(() => {
    const unsubscribeListener = attatchEnvironmentVariableListener(ownerId, environment, (newVariables) => {
      if (newVariables) {
        dispatch(environmentVariablesActions.setVariables({ newVariables, environment }));
      }
    });

    return () => {
      unsubscribeListener();
    };
  }, [dispatch, environment, ownerId]);

  const setVariable = async (key: string, value: EnvironmentVariableValue) => {
    const newVariable: EnvironmentVariable = {
      [key]: {
        localValue: value.localValue,
        syncValue: value.syncValue,
      },
    };

    return setEnvironmentVariablesInDB(ownerId, {
      newVariables: newVariable,
      environment,
    })
      .then(() => {
        dispatch(environmentVariablesActions.setVariables({ newVariables: newVariable, environment }));
      })
      .catch((err) => {
        Logger.error("Error while setting environment variables in db", err);
      });
  };

  const getVariableValue = (key: string) => {
    return variables[environment]?.[key];
  };

  const getAllVariables = () => {
    return variables[environment];
  };

  const removeVariable = async (key: string) => {
    return removeEnvironmentVariableFromDB(ownerId, { environment, key })
      .then(() => {
        dispatch(environmentVariablesActions.removeVariable({ environment, key }));
      })
      .catch((err) => {
        Logger.error("Error while removing environment variables from db", err);
      });
  };

  return {
    environment,
    setEnvironment,
    setVariable,
    getVariableValue,
    getAllVariables,
    removeVariable,
  };
};

export default useEnvironmentVariables;

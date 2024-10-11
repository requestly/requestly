import { useEffect, useMemo, useState } from "react";
import { EnvironmentVariable, EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentVariables } from "store/features/environmentVariables/selectors";
import { environmentVariablesActions } from "store/features/environmentVariables/slice";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { renderTemplate } from "../utils";
import { attatchEnvironmentVariableListener, removeEnvironmentVariableFromDB, setEnvironmentVariablesInDB } from "..";
import Logger from "lib/logger";
import { toast } from "utils/Toast";

let unsubscribeListener: () => void = null;

const useEnvironmentVariables = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const variables = useSelector(getAllEnvironmentVariables);

  const [environment, setEnvironment] = useState<string>("default");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  useEffect(() => {
    setIsLoading(true);
    unsubscribeListener?.();
    unsubscribeListener = attatchEnvironmentVariableListener(ownerId, environment, (newVariables) => {
      dispatch(environmentVariablesActions.setVariables({ newVariables, environment }));
      setIsLoading(false);
    });

    return () => {
      unsubscribeListener();
    };
  }, [dispatch, environment, ownerId]);

  useEffect(() => {
    if (!user.loggedIn) {
      unsubscribeListener?.();
      dispatch(environmentVariablesActions.resetState());
    }
  }, [dispatch, user.loggedIn]);

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
      environment,
    })
      .then(() => {
        dispatch(environmentVariablesActions.setVariables({ newVariables: newVariable, environment }));
      })
      .catch((err) => {
        toast.error("Error while setting environment variables.");
        console.error("Error while setting environment variables in db", err);
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
        toast.error("Error while removing environment variables.");
        Logger.error("Error while removing environment variables from db", err);
      });
  };

  const renderString = <T>(template: string | Record<string, any>): T => {
    return renderTemplate(template, variables[environment]);
  };

  return {
    environment,
    setEnvironment,
    setVariable,
    getVariableValue,
    getAllVariables,
    removeVariable,
    renderString,
    isVariablesLoading: isLoading,
  };
};

export default useEnvironmentVariables;

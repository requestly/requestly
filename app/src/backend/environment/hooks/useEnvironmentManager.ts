import { useEffect, useMemo } from "react";
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

const useEnvironmentManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const allEnvironmentData = useSelector(getAllEnvironmentData);

  const ownerId = useMemo(
    () => (currentlyActiveWorkspace.id ? `team-${currentlyActiveWorkspace.id}` : user?.details?.profile?.uid),
    [currentlyActiveWorkspace.id, user?.details?.profile?.uid]
  );

  useEffect(() => {
    fetchAllEnvironmentDetails(ownerId)
      .then((environmentMap) => {
        dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap }));
      })
      .catch((err) => {
        Logger.error("Error while fetching all environment variables", err);
        dispatch(environmentVariablesActions.setAllEnvironmentData({ environmentMap: {} }));
      });
  }, [dispatch, ownerId]);

  useEffect(() => {
    unsubscribeListener?.();
    if (ownerId && currentEnvironmentId) {
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
  }, [currentEnvironmentId, dispatch, ownerId]);

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

  const addNewEnvironment = async (newEnvironment: string) => {
    return upsertEnvironmentInDB(ownerId, newEnvironment).catch((err) => {
      console.error("Error while setting environment in db", err);
    });
  };

  const setCurrentEnvironment = (environmentId: string) => {
    dispatch(environmentVariablesActions.setCurrentEnvironment({ environmentId }));
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
    const currentEnvironmentVariables = allEnvironmentData[currentEnvironmentId]?.variables;
    return renderTemplate(template, currentEnvironmentVariables);
  };

  const getEnvironmentVariables = (environmentId: string) => {
    return allEnvironmentData[environmentId]?.variables ?? {};
  };

  return {
    setCurrentEnvironment,
    addNewEnvironment,
    getCurrentEnvironment,
    setVariables,
    removeVariable,
    renderVariables,
    getEnvironmentVariables,
  };
};

export default useEnvironmentManager;

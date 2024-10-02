import { useCallback, useEffect, useMemo, useState } from "react";
import { EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentVariables } from "store/features/environment/selectors";
import { environmentVariablesActions } from "store/features/environment/slice";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import firebaseApp from "firebase";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { setEnvironmentVariable } from "..";

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

  const attachEnvironmentVariableListener = useCallback(() => {
    const db = getFirestore(firebaseApp);

    const variableQuery = doc(db, "environmentVariables", ownerId);

    return onSnapshot(variableQuery, (doc) => {
      if (doc.exists()) {
        const variables: Record<string, string> = doc.data()[environment];

        if (variables) {
          const newVariables = Object.entries(variables).reduce((acc, [key, value]) => {
            acc[key] = {
              syncValue: value,
            };
            return acc;
          }, {} as Record<string, EnvironmentVariableValue>);

          dispatch(environmentVariablesActions.setVariables({ newVariables, environment }));
        }
      }
    });
  }, [dispatch, environment, ownerId]);

  useEffect(() => {
    const unsubscribeListener = attachEnvironmentVariableListener();

    return () => {
      unsubscribeListener();
    };
  }, [attachEnvironmentVariableListener, ownerId]);

  const setVariable = async (key: string, value: EnvironmentVariableValue) => {
    const newVariable: Record<string, EnvironmentVariableValue> = {
      [key]: {
        localValue: value.localValue,
        syncValue: value.syncValue,
      },
    };

    dispatch(environmentVariablesActions.setVariables({ newVariables: newVariable, environment }));
    return setEnvironmentVariable(ownerId, {
      newVariable: {
        key,
        value: value.syncValue,
      },
      environment,
    });
  };

  const getVariableValue = (key: string) => {
    return variables[environment]?.[key];
  };

  const getAllVariables = () => {
    return variables[environment];
  };

  return {
    environment,
    setEnvironment,
    setVariable,
    getVariableValue,
    getAllVariables,
  };
};

export default useEnvironmentVariables;

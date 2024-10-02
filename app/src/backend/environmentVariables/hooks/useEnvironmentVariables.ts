import { useState } from "react";
import { EnvironmentVariableValue } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { getAllEnvironmentVariables } from "store/features/environmentVariables/selectors";
import { environmentVariablesActions } from "store/features/environmentVariables/slice";

const useEnvironmentVariables = () => {
  const dispatch = useDispatch();
  const variables = useSelector(getAllEnvironmentVariables);

  const [environment, setEnvironment] = useState<string>("default");

  const setVariable = (key: string, value: EnvironmentVariableValue) => {
    const newVariable: Record<string, EnvironmentVariableValue> = {
      [key]: {
        localValue: value.localValue,
        syncValue: value.syncValue,
      },
    };

    dispatch(environmentVariablesActions.setVariable({ newVariable, environment }));
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

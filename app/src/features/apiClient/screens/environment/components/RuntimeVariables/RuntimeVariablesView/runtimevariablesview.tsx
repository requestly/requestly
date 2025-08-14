import React, { useCallback, useMemo, useState } from "react";
import { RuntimeVariablesList, RuntimeVariableTableRow } from "../RuntimeVariablesList/runtimevariableslist";
import { RuntimevariablesHeader } from "../RuntimeVariablesHeader";
import { useRuntimeVariables } from "features/apiClient/hooks/useRuntimeVariables.hook";
import { mapToEnvironmentArray } from "../../../utils";
import { RuntimeVariableValue } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";

interface RuntimeVariablesViewProps {
  varId: string;
}

export const RuntimeVariablesView: React.FC<RuntimeVariablesViewProps> = ({ varId }) => {
  const [runtimeVariablesMap, resetVariables] = useRuntimeVariables((s) => [s.data, s.reset]);
  const runtimeVariableData = Object.fromEntries(runtimeVariablesMap);

  const variables = useMemo(() => {
    return mapToEnvironmentArray(runtimeVariableData);
  }, [runtimeVariableData]);

  const handleUpdate = useCallback(
    (variables: RuntimeVariableTableRow[]) => {
      const newVariablesMap = new Map(
        variables.map((v) => [
          v.key,
          {
            syncValue: v.syncValue,
            isPersisted: v.isPersisted,
            id: v.id,
          } as RuntimeVariableValue,
        ])
      );
      resetVariables(newVariablesMap);
    },
    [resetVariables]
  );

  const [searchValue] = useState<string>("");
  return (
    <div key={varId} className="runtime-variables-view-container">
      <div className="runtime-variables-list-view">
        <RuntimevariablesHeader />
        <RuntimeVariablesList searchValue={searchValue} variables={variables} onVariablesChange={handleUpdate} />
      </div>
    </div>
  );
};

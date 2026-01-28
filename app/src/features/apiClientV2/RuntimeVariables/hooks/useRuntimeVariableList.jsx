import {
  useBufferedRuntimeVariablesEntity,
  useIsBufferDirty
} from 'features/apiClient/slices/entities/hooks';
import { useApiClientSelector } from 'features/apiClient/slices/hooks/base.hooks';
import { VARIABLE_TYPE_OPTIONS } from 'features/apiClientV2/constants/requestVariables';
import { useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react';

const existsInBackend = (variablesData, id) =>
  Object.values(variablesData).some((v) => v.id === id);

export default function useRuntimeVariableList({ searchValue = '' }) {
  const entity = useBufferedRuntimeVariablesEntity();
  const variables = entity.variables;
  const variablesData = useApiClientSelector((s) => variables.getAll(s));
  const hasUnsavedChanges = useIsBufferDirty({
    bufferId: entity.meta.id,
    type: 'bufferId'
  });

  const addNewRow = () => {
    variables.add({
      key: '',
      type: VARIABLE_TYPE_OPTIONS.string.value,
      syncValue: '',
      localValue: '',
      isPersisted: true
    });
  };

  const handleVariableChange = useCallback(
    (row, fieldChanged, changedValue) => {
      try {
        if (!existsInBackend(variablesData, row.id)) {
          if (row.key) {
            variables.add({
              ...row,
              [fieldChanged]: changedValue,
              isPersisted: true
            });
          }
          return;
        }
        variables.set({ id: row.id, [fieldChanged]: changedValue });
      } catch (error) {
        console.error('Failed to update variable', error);
        Sentry.captureException(
          error instanceof Error ? error : new Error(String(error)),
          {
            tags: { feature: 'api_client', component: 'variables_list' },
            extra: { variableId: row.id, fieldChanged }
          }
        );
        // Error is handled silently as it's a local state update
      }
    },
    [variables, variablesData]
  );

  const finalVariablesData = useMemo(() => {
    const keysLength = Object.keys(variablesData).length;
    if (keysLength === 0) {
      return {
        '': {
          key: '',
          type: VARIABLE_TYPE_OPTIONS.string.value,
          syncValue: '',
          localValue: '',
          isPersisted: true
        }
      };
    }
    if (searchValue) {
      const filteredVariables = Object.values(
        variablesData
      ).filter((variable) =>
        variable.key.toLowerCase().includes(searchValue.toLowerCase())
      );
      const filteredVariablesMap = {};
      filteredVariables.forEach((variable) => {
        filteredVariablesMap[variable.id] = variable;
      });
      return filteredVariablesMap;
    }
    return variablesData;
  }, [variablesData, searchValue]);

  return {
    variablesData: finalVariablesData,
    hasUnsavedChanges,
    addNewRow,
    handleVariableChange
  };
}

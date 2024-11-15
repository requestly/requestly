import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { EnvironmentVariableValue, VariableExport } from "backend/environment/types";

export const processApiRecordsToImport = (records: RQAPI.ApiRecord[] | RQAPI.CollectionRecord[], uid: string) => {
  const apis: RQAPI.ApiRecord[] = [];
  const collections: RQAPI.CollectionRecord[] = [];

  records.forEach((record: RQAPI.ApiRecord | RQAPI.CollectionRecord) => {
    record.createdBy = uid || null;
    record.updatedBy = uid || null;
    record.ownerId = uid || null;

    if (isApiRequest(record)) {
      apis.push(record);
    } else if (isApiCollection(record)) {
      collections.push(record);
    }
  });

  return {
    parsedRecords: records,
    apis,
    collections,
    count: collections.length + apis.length,
  };
};

export const processVariablesToImport = (
  variables: VariableExport[],
  existingVariables: Record<string, EnvironmentVariableValue>
) => {
  const newVariables = variables.reduce((acc: Record<string, EnvironmentVariableValue>, variableData) => {
    acc[variableData.key] = {
      syncValue: variableData.syncValue,
      type: variableData.type,
      localValue: variableData.localValue || "",
    };
    return acc;
  }, {});

  return {
    ...existingVariables,
    ...newVariables,
  };
};

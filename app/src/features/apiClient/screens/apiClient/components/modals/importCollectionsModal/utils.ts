import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { EnvironmentVariableValue, VariableExport } from "backend/environment/types";
import { generateDocumentId } from "backend/utils";

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

interface ImportData {
  records: (RQAPI.ApiRecord | RQAPI.CollectionRecord)[];
  environments?: { name: string; variables: Record<string, EnvironmentVariableValue>; isGlobal: boolean }[];
}

interface UpdatedApiRecordsToImport {
  collections: RQAPI.CollectionRecord[];
  apis: RQAPI.ApiRecord[];
}

export const processRqImportData = (
  fileContent: ImportData,
  uid: string | null,
  isSample?: boolean
): {
  apis: RQAPI.ApiRecord[];
  collections: RQAPI.CollectionRecord[];
  environments: any[];
  count: number;
} => {
  const apis: RQAPI.ApiRecord[] = [];
  const collections: RQAPI.CollectionRecord[] = [];

  const { records = [], environments = [] } = fileContent;

  records.forEach((record) => {
    record.createdBy = uid || null;
    record.updatedBy = uid || null;
    record.ownerId = uid || null;

    if (isApiRequest(record)) {
      apis.push(record);
    } else if (isApiCollection(record)) {
      collections.push(record);
    }
  });

  const updatedApiRecordsToImport: UpdatedApiRecordsToImport = {
    collections: [],
    apis: [],
  };

  const oldToNewIdMap: Record<string, string> = {};

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    const oldId = collection.id;
    delete collection.id;
    const newId = generateDocumentId("apis");
    collection.id = newId;
    oldToNewIdMap[oldId] = newId;
  });

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    const collectionToImport = { ...collection, name: `${isSample ? "[Sample]" : "[Imported]"} ${collection.name}` };
    if (collectionToImport.collectionId) {
      const oldCollectionId = collectionToImport.collectionId;
      delete collectionToImport.collectionId;
      collectionToImport.collectionId = oldToNewIdMap[oldCollectionId] ?? "";
    }
    updatedApiRecordsToImport.collections.push(collectionToImport);
  });

  apis.forEach((api: RQAPI.ApiRecord) => {
    const apiToImport = { ...api };
    delete apiToImport.id;
    const newCollectionId = oldToNewIdMap[apiToImport.collectionId];

    if (!newCollectionId) {
      throw new Error(`Failed to find new collection ID for API: ${api.name || api.id}`);
    }

    const updatedApi = { ...apiToImport, collectionId: newCollectionId };
    updatedApiRecordsToImport.apis.push(updatedApi);
  });

  return {
    apis: updatedApiRecordsToImport.apis,
    collections: updatedApiRecordsToImport.collections,
    environments,
    count: records.length,
  };
};

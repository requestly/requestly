import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { generateDocumentId } from "backend/utils";
import { EnvironmentVariableValue } from "backend/environment/types";

interface ImportData {
  records: (RQAPI.ApiRecord | RQAPI.CollectionRecord)[];
  environments: { name: string; variables: Record<string, EnvironmentVariableValue>; isGlobal: boolean }[];
}

interface UpdatedApiRecordsToImport {
  collections: RQAPI.CollectionRecord[];
  apis: RQAPI.ApiRecord[];
}

export const processRqImportData = (
  fileContent: ImportData,
  uid: string | null
): {
  apis: RQAPI.ApiRecord[];
  collections: RQAPI.CollectionRecord[];
  environments: any[];
  count: number;
} => {
  const apis: RQAPI.ApiRecord[] = [];
  const collections: RQAPI.CollectionRecord[] = [];

  const { records = [], environments = [] } = fileContent;

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

  const updatedApiRecordsToImport: UpdatedApiRecordsToImport = {
    collections: [],
    apis: [],
  };

  const oldToNewIdMap: Record<string, string> = {};

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    const collectionToImport = { ...collection, name: `(Imported) ${collection.name}` };
    delete collectionToImport.id;
    const newId = generateDocumentId("apis");
    collectionToImport.id = newId;
    oldToNewIdMap[collection.id] = newId;
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

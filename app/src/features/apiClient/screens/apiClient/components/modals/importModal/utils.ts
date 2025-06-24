import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { EnvironmentVariableValue } from "backend/environment/types";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";

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
  uid: string | null,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
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
    const oldId = collection.id;
    delete collection.id;
    const newId = apiClientRecordsRepository.generateCollectionId(
      collection.name,
      oldToNewIdMap[collection.collectionId]
    );
    collection.id = newId;
    oldToNewIdMap[oldId] = newId;
  });

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    if (collection.collectionId) {
      const oldCollectionId = collection.collectionId;
      delete collection.collectionId;
      collection.collectionId = oldToNewIdMap[oldCollectionId] ?? "";
    }
    updatedApiRecordsToImport.collections.push(collection);
  });

  apis.forEach((api: RQAPI.ApiRecord) => {
    const apiToImport = { ...api };
    delete apiToImport.id;
    const newCollectionId = oldToNewIdMap[apiToImport.collectionId];
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

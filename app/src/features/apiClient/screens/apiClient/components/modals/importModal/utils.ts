import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { EnvironmentVariableData } from "features/apiClient/store/variables/types";
import { KeyValuePair } from "@requestly/shared/types/entities/apiClient";

export interface RQImportData {
  records: (RQAPI.ApiRecord | RQAPI.CollectionRecord)[];
  environments: { name: string; variables: Record<string, EnvironmentVariableData>; isGlobal: boolean }[];
}

interface UpdatedApiRecordsToImport {
  collections: RQAPI.CollectionRecord[];
  apis: RQAPI.ApiRecord[];
  examples: RQAPI.ExampleApiRecord[];
}

export const processRqImportData = (
  fileContent: RQImportData,
  uid: string | null,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): {
  apis: RQAPI.ApiRecord[];
  collections: RQAPI.CollectionRecord[];
  examples: RQAPI.ExampleApiRecord[];
  environments: any[];
  count: number;
} => {
  const apis: RQAPI.ApiRecord[] = [];
  const collections: RQAPI.CollectionRecord[] = [];

  const { records = [], environments = [] } = fileContent;

  records.forEach((record: any) => {
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
    examples: [],
  };

  const oldToNewIdMap: Record<string, string> = {};

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    const oldId = collection.id;
    const newId = apiClientRecordsRepository.generateCollectionId(
      collection.name,
      oldToNewIdMap[collection.collectionId]
    );
    collection.id = newId;
    oldToNewIdMap[oldId] = newId;
  });

  collections.forEach((collection: RQAPI.CollectionRecord) => {
    if (collection.collectionId) {
      collection.collectionId = oldToNewIdMap[collection.collectionId] ?? "";
    }
    updatedApiRecordsToImport.collections.push(collection);
  });

  apis.forEach((api: RQAPI.ApiRecord) => {
    const apiToImport = { ...api };
    const newCollectionId = oldToNewIdMap[apiToImport.collectionId];
    const updatedApi = { ...apiToImport, collectionId: newCollectionId };

    if (updatedApi.data.request?.headers?.length > 0) {
      updatedApi.data.request.headers = updatedApi.data.request.headers.map((header: KeyValuePair, index: number) => {
        return {
          ...header,
          isEnabled: header.isEnabled ?? true,
          id: header.id ?? index,
        };
      });
    }

    if (updatedApi?.data?.type === RQAPI.ApiEntryType.HTTP && updatedApi.data.request?.queryParams.length > 0) {
      updatedApi.data.request.queryParams = updatedApi.data.request.queryParams.map(
        (queryParam: KeyValuePair, index: number) => {
          return {
            ...queryParam,
            isEnabled: queryParam.isEnabled ?? true,
            id: queryParam.id ?? index,
          };
        }
      );
    }

    updatedApiRecordsToImport.apis.push(updatedApi);
  });

  return {
    apis: updatedApiRecordsToImport.apis,
    collections: updatedApiRecordsToImport.collections,
    examples: updatedApiRecordsToImport.examples,
    environments,
    count: records.length,
  };
};

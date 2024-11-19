import { EnvironmentVariableValue } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { v4 as uuidv4 } from "uuid";

export const getUploadedPostmanFileType = (fileContent: any) => {
  if (fileContent?.info?.schema && fileContent?.info?._collection_link) {
    return "collection";
  }
  if (fileContent?._postman_variable_scope) {
    return "environment";
  }
  return null;
};

export const processPostmanEnvironmentData = (fileContent: any) => {
  if (!fileContent.values.length) {
    throw new Error("No variables found in the environment file");
  }

  const variables = fileContent.values.reduce((acc: Record<string, EnvironmentVariableValue>, variable: any) => {
    acc[variable.key] = {
      syncValue: variable.value,
      type: variable.type === "secret" ? "secret" : "string",
    };
    return acc;
  }, {});

  return {
    name: fileContent.name,
    variables,
  };
};

const createApiRecord = (item: any, parentCollectionId: string): Partial<RQAPI.ApiRecord> => {
  const { request } = item;
  if (!request) throw new Error(`Invalid API item: ${item.name}`);

  const queryParams =
    request.url?.query?.map((query: any, index: number) => ({
      id: index,
      key: query.key,
      value: query.value,
      isEnabled: true,
    })) ?? [];

  const headers =
    request.header?.map((header: any, index: number) => ({
      id: index,
      key: header.key,
      value: header.value,
      isEnabled: true,
    })) ?? [];

  return {
    id: uuidv4(),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    deleted: false,
    data: {
      request: {
        url: request.url?.raw,
        method: request.method,
        queryParams,
        headers,
        body: request.body?.raw ?? null,
      },
    },
  };
};

const createCollectionRecord = (name: string, id = uuidv4()): Partial<RQAPI.CollectionRecord> => ({
  id,
  name,
  deleted: false,
  data: {},
  type: RQAPI.RecordType.COLLECTION,
});

export const processPostmanCollectionData = (
  fileContent: any
): { collections: Partial<RQAPI.CollectionRecord>[]; apis: Partial<RQAPI.ApiRecord>[] } => {
  if (!fileContent.info?.name) {
    throw new Error("Invalid collection file: missing name");
  }

  const processItems = (items: any[], parentCollectionId: string) => {
    const result = {
      collections: [] as Partial<RQAPI.CollectionRecord>[],
      apis: [] as Partial<RQAPI.ApiRecord>[],
    };

    items.forEach((item) => {
      if (item.item?.length) {
        // This is a sub-collection
        const collectionId = uuidv4();
        result.collections.push(createCollectionRecord(item.name, collectionId));

        const subItems = processItems(item.item, collectionId);
        result.collections.push(...subItems.collections);
        result.apis.push(...subItems.apis);
      } else if (item.request) {
        // This is an API endpoint
        result.apis.push(createApiRecord(item, parentCollectionId));
      }
    });

    return result;
  };

  const rootCollectionId = uuidv4();
  const rootCollection = createCollectionRecord(fileContent.info.name, rootCollectionId);
  const processedItems = processItems(fileContent.item, rootCollectionId);

  return {
    collections: [rootCollection, ...processedItems.collections],
    apis: processedItems.apis,
  };
};

export const processPostmanVariablesData = (fileContent: any): Record<string, EnvironmentVariableValue> | null => {
  if (!fileContent?.variable?.length) {
    return null;
  }

  const variables = fileContent.variable.reduce((acc: Record<string, EnvironmentVariableValue>, variable: any) => {
    acc[variable.key] = {
      syncValue: variable.value,
      type: variable.type === "secret" ? "secret" : "string",
    };
    return acc;
  }, {});

  return variables;
};

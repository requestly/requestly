import { EnvironmentVariableValue } from "backend/environment/types";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import { generateDocumentId } from "backend/utils";

interface PostmanCollectionExport {
  info: {
    name: string;
    schema: string;
  };
  item: any[];
  variable: any[];
}

interface PostmanEnvironmentExport {
  name: string;
  values: {
    key: string;
    value: string;
    type: string;
    enabled: boolean;
  }[];
  _postman_variable_scope: string;
}

export const getUploadedPostmanFileType = (fileContent: PostmanCollectionExport | PostmanEnvironmentExport) => {
  if ("info" in fileContent && fileContent.info?.schema) {
    return "collection";
  }
  if ("_postman_variable_scope" in fileContent && fileContent._postman_variable_scope) {
    return "environment";
  }
  return null;
};

export const processPostmanEnvironmentData = (fileContent: PostmanEnvironmentExport) => {
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
    id: generateDocumentId("apis"),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    deleted: false,
    data: {
      request: {
        url: request.url?.raw || "",
        method: request.method || RequestMethod.GET,
        queryParams,
        headers,
        body: request.body?.raw ?? null,
      },
    },
  };
};

const createCollectionRecord = (name: string, id = generateDocumentId("apis")): Partial<RQAPI.CollectionRecord> => ({
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
        const subCollection = createCollectionRecord(item.name, generateDocumentId("apis"));
        subCollection.collectionId = parentCollectionId;
        result.collections.push(subCollection);

        const subItems = processItems(item.item, subCollection.id);
        result.collections.push(...subItems.collections);
        result.apis.push(...subItems.apis);
      } else if (item.request) {
        // This is an API endpoint
        result.apis.push(createApiRecord(item, parentCollectionId));
      }
    });

    return result;
  };

  const rootCollectionId = generateDocumentId("apis");
  const rootCollection = createCollectionRecord(fileContent.info.name, rootCollectionId);
  rootCollection.collectionId = "";
  const processedItems = processItems(fileContent.item, rootCollectionId);

  return {
    collections: [rootCollection, ...processedItems.collections],
    apis: processedItems.apis,
  };
};

export const processPostmanVariablesData = (
  fileContent: PostmanCollectionExport
): Record<string, EnvironmentVariableValue> | null => {
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
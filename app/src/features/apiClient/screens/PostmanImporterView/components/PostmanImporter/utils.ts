import { EnvironmentVariableType } from "backend/environment/types";
import { KeyValuePair, PostmanBodyMode, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { POSTMAN_AUTH_TYPES_MAPPING, PostmanAuth } from "features/apiClient/constants";
import { Authorization } from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { isEmpty } from "lodash";
import {
  getDefaultAuth,
  getDefaultAuthType,
} from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { EnvironmentVariableData } from "features/apiClient/store/variables/types";
import { createBodyContainer } from "features/apiClient/screens/apiClient/utils";

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

interface RequestBodyProcessingResult {
  requestBody: RQAPI.RequestBody;
  contentType: RequestContentType;
}
interface RequestHeadersProcessingResult {
  headers: KeyValuePair[];
}
export const getUploadedPostmanFileType = (fileContent: PostmanCollectionExport | PostmanEnvironmentExport) => {
  if ("info" in fileContent && fileContent.info?.schema) {
    return "collection";
  }
  if ("values" in fileContent) {
    return "environment";
  }
  return null;
};

export const processPostmanEnvironmentData = (fileContent: PostmanEnvironmentExport) => {
  const isGlobalEnvironment = fileContent?._postman_variable_scope === "globals";

  const variables = fileContent.values.reduce(
    (acc: Record<string, EnvironmentVariableData>, variable: any, index: number) => {
      // dont add variables with empty key
      if (!variable.key) {
        return acc;
      }

      acc[variable.key] = {
        id: index,
        isPersisted: true,
        syncValue: variable.value ?? "",
        type:
          variable.type === EnvironmentVariableType.Secret
            ? EnvironmentVariableType.Secret
            : EnvironmentVariableType.String,
      };
      return acc;
    },
    {}
  );

  return {
    name: fileContent.name,
    variables,
    isGlobal: isGlobalEnvironment,
  };
};

const processScripts = (item: any) => {
  const scripts = {
    preRequest: "",
    postResponse: "",
  };

  const migratePostmanScripts = (postmanScript: string) => {
    if (!postmanScript) {
      return "";
    }
    return postmanScript.replace(/pm\./g, "rq."); // Replace all occurrences of 'pm.' with 'rq.'
  };

  if (!item.event?.length) {
    return scripts;
  }

  item.event.forEach((event: any) => {
    if (event.listen === "prerequest") {
      scripts.preRequest = event.script ? migratePostmanScripts(event.script.exec?.join("\n")) : "";
    } else if (event.listen === "test") {
      scripts.postResponse = event.script ? migratePostmanScripts(event.script.exec?.join("\n")) : "";
    }
  });

  return scripts;
};

const processAuthorizationOptions = (item: PostmanAuth.Item | undefined, parentCollectionId?: string): RQAPI.Auth => {
  if (isEmpty(item)) return getDefaultAuth(parentCollectionId === null);

  const currentAuthType = POSTMAN_AUTH_TYPES_MAPPING[item.type] ?? getDefaultAuthType(parentCollectionId === null);

  const auth: RQAPI.Auth = { currentAuthType, authConfigStore: {} };

  if (item.type === PostmanAuth.AuthType.BEARER_TOKEN) {
    const authOptions = item[item.type];
    const token = authOptions[0];
    auth.authConfigStore[Authorization.Type.BEARER_TOKEN] = {
      bearer: token.value,
    };
  } else if (item.type === PostmanAuth.AuthType.BASIC_AUTH) {
    const basicAuthOptions = item[item.type];
    //if somehow username or password comes undefined return empty string in that case as fallback to avoid runtime error
    let username: PostmanAuth.KV<"username"> | undefined, password: PostmanAuth.KV<"password"> | undefined;

    basicAuthOptions.forEach((option) => {
      if (option.key === "username") {
        username = option;
      } else if (option.key === "password") {
        password = option;
      }
    });

    auth.authConfigStore[Authorization.Type.BASIC_AUTH] = {
      username: username?.value ?? "",
      password: password?.value ?? "",
    };
  } else if (item.type === PostmanAuth.AuthType.API_KEY) {
    const apiKeyOptions = item[item.type];
    let keyLabel: PostmanAuth.KV<"key"> | undefined;
    let apiKey: PostmanAuth.KV<"value"> | undefined;
    let addTo: Authorization.API_KEY_CONFIG["addTo"] = "HEADER";

    apiKeyOptions.forEach((option) => {
      if (option.key === "key") {
        keyLabel = option;
      } else if (option.key === "value") {
        apiKey = option;
      } else if (option.key === "in") {
        addTo = option.value === "header" ? "HEADER" : "QUERY";
      }
    });

    auth.authConfigStore[Authorization.Type.API_KEY] = {
      key: keyLabel?.value ?? "",
      value: apiKey?.value ?? "",
      addTo,
    };
  }
  return auth;
};

const getContentTypeForRawBody = (bodyType: string) => {
  switch (bodyType) {
    case "json":
      return RequestContentType.JSON;
    case "text":
      return RequestContentType.RAW;
    case "html":
      return RequestContentType.HTML;
    case "javascript":
      return RequestContentType.JAVASCRIPT;
    case "xml":
      return RequestContentType.XML;
    default:
      return RequestContentType.RAW;
  }
};

const processRawRequestBody = (raw: string, options: any): RequestBodyProcessingResult => {
  const contentType = getContentTypeForRawBody(options?.raw?.language);

  return {
    requestBody: raw,
    contentType,
  };
};

const processFormDataBody = (formdata: any[]): RequestBodyProcessingResult => {
  return {
    requestBody:
      formdata?.map((formData: { key: string; value?: any; src?: any; type: "file" | "text" }) => ({
        id: Date.now(),
        key: formData.key,
        value: formData.type === "file" ? formData.src : formData.value,
        isEnabled: true,
        type: formData.type,
      })) || [],
    contentType: RequestContentType.MULTIPART_FORM,
  };
};

const processUrlEncodedBody = (urlencoded: any[]): RequestBodyProcessingResult => {
  const contentType = RequestContentType.FORM;

  return {
    requestBody: urlencoded.map((data: { key: string; value: string }) => ({
      id: Date.now() + Math.random(),
      key: data?.key || "",
      value: data?.value || "",
      isEnabled: true,
    })),
    contentType,
  };
};

const processRequestBody = (request: any): RequestBodyProcessingResult => {
  if (!request.body) {
    return {
      requestBody: "",
      contentType: RequestContentType.RAW,
    };
  }

  const processGraphqlBody = (graphql: any): RequestBodyProcessingResult => {
    const contentType = RequestContentType.JSON;
    return {
      requestBody: JSON.stringify(graphql),
      contentType,
    };
  };

  const { mode, raw, formdata, options, urlencoded, graphql } = request.body;

  switch (mode) {
    case PostmanBodyMode.RAW:
      return processRawRequestBody(raw, options);
    case PostmanBodyMode.FORMDATA:
      return processFormDataBody(formdata);
    case PostmanBodyMode.URL_ENCODED:
      return processUrlEncodedBody(urlencoded);
    case PostmanBodyMode.GRAPHQL:
      return processGraphqlBody(graphql);
    default:
      return {
        requestBody: "",
        contentType: RequestContentType.RAW,
      };
  }
};

export const processRequestHeaders = (request: any): RequestHeadersProcessingResult => {
  const headers =
    request.header?.map((header: { key: string; value: string; disabled: boolean; type: string }, index: number) => ({
      id: index,
      key: header.key,
      value: header.value,
      isEnabled: !header?.disabled,
    })) ?? [];

  return { headers };
};

const createApiRecord = (
  item: any,
  parentCollectionId: string,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): Partial<RQAPI.ApiRecord> => {
  const { request } = item;
  if (!request) throw new Error(`Invalid API item: ${item.name}`);

  const queryParams =
    request.url?.query?.map((query: any, index: number) => ({
      id: index,
      key: query.key,
      value: query.value,
      isEnabled: true,
    })) ?? [];

  const { requestBody, contentType } = processRequestBody(request);
  const { headers } = processRequestHeaders(request);

  return {
    id: apiClientRecordsRepository.generateApiRecordId(parentCollectionId),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    deleted: false,
    data: {
      type: RQAPI.ApiEntryType.HTTP,
      request: {
        url: typeof request.url === "string" ? request.url : request.url?.raw ?? "",
        method: request.method || RequestMethod.GET,
        queryParams,
        headers,
        body: requestBody,
        bodyContainer: createBodyContainer({ contentType, body: requestBody }),
        contentType,
      },
      response: null,
      auth: processAuthorizationOptions(request.auth, parentCollectionId),
      scripts: processScripts(item),
    },
  } as RQAPI.HttpApiRecord;
};

const createCollectionRecord = (
  name: string,
  description: string,
  id: string,
  variables?: any[],
  auth?: any,
  parentCollectionId?: string
): Partial<RQAPI.CollectionRecord> => {
  const collectionVariables: Record<string, EnvironmentVariableData> = {};
  if (variables) {
    variables.forEach((variable: any, index: number) => {
      collectionVariables[variable.key] = {
        id: index,
        syncValue: variable.value,
        isPersisted: true,
        type:
          variable.type === EnvironmentVariableType.Secret
            ? EnvironmentVariableType.Secret
            : EnvironmentVariableType.String,
      };
    });
  }

  return {
    id,
    name,
    description,
    deleted: false,
    data: {
      variables: collectionVariables,
      auth: processAuthorizationOptions(auth, parentCollectionId),
    },
    type: RQAPI.RecordType.COLLECTION,
  };
};

export const processPostmanCollectionData = (
  fileContent: any,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
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
        const subCollection = createCollectionRecord(
          item.name,
          item.description || "",
          apiClientRecordsRepository.generateCollectionId(item.name, parentCollectionId),
          [],
          item.auth,
          parentCollectionId
        );
        subCollection.collectionId = parentCollectionId;
        result.collections.push(subCollection);

        //subCollection.id is necessary since it acts as a parentCollectionId for nested child collections
        //should we throw any error if subCollection.id is not available or missing?
        if (subCollection.id) {
          const subItems = processItems(item.item, subCollection.id);
          result.collections.push(...subItems.collections);
          result.apis.push(...subItems.apis);
        }
      } else if (item.request) {
        // This is an API endpoint
        const data = createApiRecord(item, parentCollectionId, apiClientRecordsRepository);
        result.apis.push(data);
      }
    });

    return result;
  };

  const rootCollectionId = apiClientRecordsRepository.generateCollectionId(fileContent.info.name);
  const rootCollection = createCollectionRecord(
    fileContent.info.name,
    fileContent.info?.description || "",
    rootCollectionId,
    fileContent.variable,
    fileContent.auth
  );
  rootCollection.collectionId = "";
  const processedItems = processItems(fileContent.item, rootCollectionId);

  return {
    collections: [rootCollection, ...processedItems.collections],
    apis: processedItems.apis,
  };
};

export const processPostmanVariablesData = (
  fileContent: PostmanCollectionExport
): Record<string, EnvironmentVariableData> | null => {
  if (!fileContent?.variable?.length) {
    return null;
  }

  const variables = fileContent.variable.reduce(
    (acc: Record<string, EnvironmentVariableData>, variable: any, index: number) => {
      acc[variable.key] = {
        id: index,
        syncValue: variable.value,
        isPersisted: true,
        type:
          variable.type === EnvironmentVariableType.Secret
            ? EnvironmentVariableType.Secret
            : EnvironmentVariableType.String,
      };
      return acc;
    },
    {}
  );

  return variables;
};

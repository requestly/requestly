import { EnvironmentVariableType, EnvironmentVariableValue } from "backend/environment/types";
import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { generateDocumentId } from "backend/utils";
import { POSTMAN_AUTH_TYPES_MAPPING, PostmanAuth } from "features/apiClient/constants";
import { Authorization } from "features/apiClient/screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";
import { getDefaultAuth, getDefaultAuthType } from "backend/apiClient/migrations/auth";
import { isEmpty } from "lodash";

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
  if ("values" in fileContent) {
    return "environment";
  }
  return null;
};

export const processPostmanEnvironmentData = (fileContent: PostmanEnvironmentExport) => {
  const isGlobalEnvironment = fileContent?._postman_variable_scope === "globals";

  const variables = fileContent.values.reduce(
    (acc: Record<string, EnvironmentVariableValue>, variable: any, index: number) => {
      // dont add variables with empty key
      if (!variable.key) {
        return acc;
      }

      acc[variable.key] = {
        id: index,
        syncValue: variable.value,
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
    return postmanScript.replace(/pm\./g, "rq."); // Replace all occurrences of 'pm.' with 'rq.'
  };

  if (!item.event?.length) {
    return scripts;
  }

  item.event.forEach((event: any) => {
    if (event.listen === "prerequest") {
      scripts.preRequest = migratePostmanScripts(event.script.exec.join("\n"));
    } else if (event.listen === "test") {
      scripts.postResponse = migratePostmanScripts(event.script.exec.join("\n"));
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
    let username: PostmanAuth.KV<"username">, password: PostmanAuth.KV<"password">;

    basicAuthOptions.forEach((option) => {
      if (option.key === "username") {
        username = option;
      } else if (option.key === "password") {
        password = option;
      }
    });

    auth.authConfigStore[Authorization.Type.BASIC_AUTH] = {
      username: username.value,
      password: password.value,
    };
  } else if (item.type === PostmanAuth.AuthType.API_KEY) {
    const apiKeyOptions = item[item.type];
    let keyLabel: PostmanAuth.KV<"key">;
    let apiKey: PostmanAuth.KV<"value">;
    let addTo: Authorization.API_KEY_CONFIG["addTo"];

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
      key: keyLabel.value,
      value: apiKey.value,
      addTo,
    };
  }
  return auth;
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

  let contentType: RequestContentType | null = null;
  let requestBody: string | KeyValuePair[] | null = null;

  const { mode, raw, formdata, options, urlencoded } = request.body || {};

  if (mode === "raw") {
    requestBody = raw;
    contentType = options?.raw.language === "json" ? RequestContentType.JSON : RequestContentType.RAW;
  } else if (mode === "formdata") {
    contentType = RequestContentType.FORM;
    requestBody =
      formdata?.map((formData: { key: string; value: string }) => ({
        id: Date.now(),
        key: formData.key,
        value: formData.value,
        isEnabled: true,
      })) || [];
  } else if (mode === "urlencoded") {
    contentType = RequestContentType.FORM;
    requestBody = urlencoded.map((data: { key: string; value: string }) => ({
      id: Date.now() + Math.random(),
      key: data.key,
      value: data.value,
      isEnabled: true,
    }));
  }

  return {
    id: generateDocumentId("apis"),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    deleted: false,
    data: {
      request: {
        url: typeof request.url === "string" ? request.url : request.url?.raw ?? "",
        method: request.method || RequestMethod.GET,
        queryParams,
        headers,
        body: requestBody,
        contentType,
      },
      auth: processAuthorizationOptions(request.auth, parentCollectionId),
      scripts: processScripts(item),
    },
  };
};

const createCollectionRecord = (
  name: string,
  description: string,
  id = generateDocumentId("apis"),
  variables?: any[],
  auth?: any,
  parentCollectionId?: string
): Partial<RQAPI.CollectionRecord> => {
  const collectionVariables: Record<string, EnvironmentVariableValue> = {};
  if (variables) {
    variables.forEach((variable: any, index: number) => {
      collectionVariables[variable.key] = {
        id: index,
        syncValue: variable.value,
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
        const subCollection = createCollectionRecord(
          item.name,
          item.description || "",
          generateDocumentId("apis"),
          [],
          item.auth,
          parentCollectionId
        );
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
): Record<string, EnvironmentVariableValue> | null => {
  if (!fileContent?.variable?.length) {
    return null;
  }

  const variables = fileContent.variable.reduce(
    (acc: Record<string, EnvironmentVariableValue>, variable: any, index: number) => {
      acc[variable.key] = {
        id: index,
        syncValue: variable.value,
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

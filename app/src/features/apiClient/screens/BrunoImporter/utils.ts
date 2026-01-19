import { EnvironmentVariableType } from "backend/environment/types";
import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { Bruno } from "./types";
import { Authorization } from "../apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { createBodyContainer } from "../apiClient/utils";
import { EnvironmentVariableData } from "@requestly/shared/types/entities/apiClient";

export const processBrunoScripts = (request: Bruno.Request) => {
  const scripts = {
    preRequest: request?.script?.req?.replace(/bru\./g, "rq.") || "",
    postResponse: request?.script?.res?.replace(/bru\./g, "rq.") || "",
  };
  return scripts;
};

const processAuthorizationOptions = (auth?: Bruno.Auth, parentCollectionId?: string): RQAPI.Auth => {
  if (!auth) {
    return {
      currentAuthType: parentCollectionId ? Authorization.Type.INHERIT : Authorization.Type.NO_AUTH,
      authConfigStore: {},
    };
  }

  switch (auth.mode) {
    case "bearer":
      return {
        currentAuthType: Authorization.Type.BEARER_TOKEN,
        authConfigStore: {
          [Authorization.Type.BEARER_TOKEN]: {
            bearer: auth.bearer?.token || "",
          },
        },
      };
    case "basic":
      return {
        currentAuthType: Authorization.Type.BASIC_AUTH,
        authConfigStore: {
          [Authorization.Type.BASIC_AUTH]: {
            username: auth.basic?.username || "",
            password: auth.basic?.password || "",
          },
        },
      };
    case "none":
      return { currentAuthType: Authorization.Type.NO_AUTH, authConfigStore: {} };
    default:
      return {
        currentAuthType: parentCollectionId ? Authorization.Type.INHERIT : Authorization.Type.NO_AUTH,
        authConfigStore: {},
      };
  }
};

const processParams = (params: Bruno.Param[]) => {
  return (
    params?.map((param, index) => ({
      id: index,
      key: param.name,
      value: param.value,
      isEnabled: param.enabled ?? true,
    })) || []
  );
};

type OmitDBFields<T> = Omit<T, "ownerId" | "deleted" | "createdBy" | "updatedBy" | "createdTs" | "updatedTs">;
const createApiRecord = (
  item: Bruno.Item,
  parentCollectionId: string,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): OmitDBFields<RQAPI.ApiRecord> => {
  if (!item.request) throw new Error(`Invalid API item: ${item.name}`);

  const { request } = item;

  // Handle body conversions
  let contentType: RequestContentType | null = null;
  let requestBody: string | KeyValuePair[] | null = null;

  if (request.body?.mode) {
    switch (request.body.mode) {
      case "json":
        contentType = RequestContentType.JSON;
        requestBody =
          typeof request.body.json === "string" ? request.body.json : JSON.stringify(request.body.json, null, 2);
        break;
      case "formUrlEncoded":
        contentType = RequestContentType.FORM;
        requestBody = processParams(request.body.formUrlEncoded);
        break;
      default:
        contentType = RequestContentType.RAW;
        requestBody = "";
        break;
    }
  } else {
    contentType = RequestContentType.RAW;
    requestBody = "";
  }

  return {
    id: apiClientRecordsRepository.generateApiRecordId(parentCollectionId),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    data: {
      type: RQAPI.ApiEntryType.HTTP,
      request: {
        url: request.url,
        method: (request.method || "GET") as RequestMethod,
        queryParams: processParams(request.params),
        headers: processParams(request.headers),
        body: requestBody,
        bodyContainer: createBodyContainer({ contentType, body: requestBody }),
        contentType,
      },
      response: null,
      auth: processAuthorizationOptions(request.auth, parentCollectionId),
      scripts: processBrunoScripts(request),
    },
  };
};

const createCollectionRecord = (
  name: string,
  id: string,
  parentCollectionId?: string,
  auth?: Bruno.Auth,
  vars?: { req?: Bruno.Variable[]; res?: Bruno.Variable[] },
  additionalVars?: Bruno.Variable[]
): Partial<RQAPI.CollectionRecord> => {
  const allVars = [...(vars?.res || []), ...(vars?.req || []), ...(additionalVars || [])];

  const variables = allVars.reduce((acc, v, index) => {
    if (v.enabled && v.name) {
      const varValue: EnvironmentVariableData = {
        id: index,
        syncValue: v.value,
        type: v.type || EnvironmentVariableType.String,
        isPersisted: true,
      };

      if (v.local) {
        varValue.localValue = v.local;
      }

      acc[v.name] = varValue;
    }
    return acc;
  }, {} as Record<string, EnvironmentVariableData>);

  return {
    id,
    name,
    collectionId: parentCollectionId || "",
    deleted: false,
    type: RQAPI.RecordType.COLLECTION,
    data: {
      variables,
      auth: processAuthorizationOptions(auth, parentCollectionId),
    },
  };
};

export const processBrunoCollectionData = (
  fileContent: Bruno.RootCollection,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): {
  collections: Partial<RQAPI.CollectionRecord>[];
  apis: Partial<RQAPI.ApiRecord>[];
  environments: {
    name: string;
    variables: Record<string, EnvironmentVariableData>;
  }[];
} => {
  const environments = (fileContent.environments || []).map((env) => ({
    name: env.name,
    variables: env.variables.reduce((acc, variable, index) => {
      if (variable.enabled) {
        acc[variable.name] = {
          id: index,
          syncValue: variable.value,
          type: variable.type || EnvironmentVariableType.String,
          isPersisted: true,
        };
      }
      return acc;
    }, {} as Record<string, EnvironmentVariableData>),
  }));

  const processItems = (
    items: Bruno.Item[],
    parentCollectionId: string,
    apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
  ) => {
    const result = {
      collections: [] as Partial<RQAPI.CollectionRecord>[],
      apis: [] as Partial<RQAPI.ApiRecord>[],
      variables: [] as Bruno.Variable[], // To track variables from requests
    };

    items.forEach((item) => {
      if (item.type === "folder" || (item.items && item.items.length > 0)) {
        const id = apiClientRecordsRepository.generateCollectionId(item.name, parentCollectionId);
        const subItems = item.items?.length
          ? processItems(item.items, id, apiClientRecordsRepository)
          : { collections: [], apis: [], variables: [] };

        const subCollection = createCollectionRecord(
          item.name,
          id,
          parentCollectionId,
          item.root?.request?.auth,
          item.root?.request?.vars,
          subItems.variables
        );

        result.collections.push(subCollection);
        result.collections.push(...subItems.collections);
        result.apis.push(...subItems.apis);
      } else if (item.type === "http") {
        result.apis.push(createApiRecord(item, parentCollectionId, apiClientRecordsRepository));
        if (item.request?.vars) {
          result.variables.push(...(item.request.vars.res || []), ...(item.request.vars.req || []));
        }
      }
    });

    return result;
  };

  const rootCollectionId = apiClientRecordsRepository.generateCollectionId(fileContent.name, "");
  const processedItems = processItems(fileContent.items, rootCollectionId, apiClientRecordsRepository);
  // Create root collection with both root vars and all nested vars
  const rootCollection = createCollectionRecord(
    fileContent.name,
    rootCollectionId,
    undefined,
    fileContent.root?.request?.auth,
    fileContent.root?.request?.vars,
    processedItems.variables
  );

  return {
    collections: [rootCollection, ...processedItems.collections],
    apis: processedItems.apis,
    environments,
  };
};

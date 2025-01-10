import { EnvironmentVariableValue } from "backend/environment/types";
import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { generateDocumentId } from "backend/utils";
import { AUTHORIZATION_TYPES } from "features/apiClient/screens/apiClient/components/clientView/components/request/components/AuthorizationView/types";
import { Bruno } from "./types";

export const processBrunoScripts = (request: Bruno.Request) => {
  const scripts = {
    preRequest: request?.script?.req || "",
    postResponse: request?.script?.res || "",
  };
  return scripts;
};

const processAuthorizationOptions = (auth?: Bruno.Auth, parentCollectionId?: string): RQAPI.AuthOptions => {
  if (!auth) {
    return {
      currentAuthType: parentCollectionId ? AUTHORIZATION_TYPES.INHERIT : AUTHORIZATION_TYPES.NO_AUTH,
    };
  }

  switch (auth.mode) {
    case "bearer":
      return {
        currentAuthType: AUTHORIZATION_TYPES.BEARER_TOKEN,
        [AUTHORIZATION_TYPES.BEARER_TOKEN]: {
          bearer: auth.bearer?.token || "",
        },
      };
    case "basic":
      return {
        currentAuthType: AUTHORIZATION_TYPES.BASIC_AUTH,
        [AUTHORIZATION_TYPES.BASIC_AUTH]: {
          username: auth.basic?.username || "",
          password: auth.basic?.password || "",
        },
      };
    case "digest":
      return {
        currentAuthType: AUTHORIZATION_TYPES.BASIC_AUTH,
        [AUTHORIZATION_TYPES.BASIC_AUTH]: {
          username: auth.digest?.username || "",
          password: auth.digest?.password || "",
        },
      };
    case "none":
      return { currentAuthType: AUTHORIZATION_TYPES.NO_AUTH };
    default:
      return {
        currentAuthType: parentCollectionId ? AUTHORIZATION_TYPES.INHERIT : AUTHORIZATION_TYPES.NO_AUTH,
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
const createApiRecord = (item: Bruno.Item, parentCollectionId: string): OmitDBFields<RQAPI.ApiRecord> => {
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
  }

  return {
    id: generateDocumentId("apis"),
    collectionId: parentCollectionId,
    name: item.name,
    type: RQAPI.RecordType.API,
    data: {
      request: {
        url: request.url,
        method: (request.method || "GET") as RequestMethod,
        queryParams: processParams(request.params),
        headers: processParams(request.headers),
        body: requestBody,
        contentType,
      },
      auth: processAuthorizationOptions(request.auth),
      scripts: processBrunoScripts(request),
    },
  };
};

type NewGeneratedId = ReturnType<typeof generateDocumentId>;

const createCollectionRecord = (
  name: string,
  id: NewGeneratedId,
  parentCollectionId?: NewGeneratedId,
  auth?: Bruno.Auth,
  vars?: { req?: Bruno.Variable[]; res?: Bruno.Variable[] },
  additionalVars?: Bruno.Variable[]
): Partial<RQAPI.CollectionRecord> => {
  const allVars = [...(vars?.res || []), ...(vars?.req || []), ...(additionalVars || [])];

  const variables = allVars.reduce((acc, v) => {
    if (v.enabled && v.name) {
      const varValue: EnvironmentVariableValue = {
        syncValue: v.value,
        type: v.type || "string",
      };

      if (v.local) {
        varValue.localValue = v.local;
      }

      acc[v.name] = varValue;
    }
    return acc;
  }, {} as Record<string, EnvironmentVariableValue>);

  return {
    id,
    name,
    collectionId: parentCollectionId || "",
    deleted: false,
    type: RQAPI.RecordType.COLLECTION,
    data: {
      variables,
      auth: processAuthorizationOptions(auth),
    },
  };
};

export const processBrunoCollectionData = (
  fileContent: Bruno.RootCollection
): {
  collections: Partial<RQAPI.CollectionRecord>[];
  apis: Partial<RQAPI.ApiRecord>[];
  environments: {
    name: string;
    variables: Record<string, EnvironmentVariableValue>;
  }[];
} => {
  const environments = (fileContent.environments || []).map((env) => ({
    name: env.name,
    variables: env.variables.reduce((acc, variable) => {
      if (variable.enabled) {
        acc[variable.name] = {
          syncValue: variable.value,
          type: variable.type || "string",
        };
      }
      return acc;
    }, {} as Record<string, EnvironmentVariableValue>),
  }));

  const processItems = (items: Bruno.Item[], parentCollectionId: string) => {
    const result = {
      collections: [] as Partial<RQAPI.CollectionRecord>[],
      apis: [] as Partial<RQAPI.ApiRecord>[],
      variables: [] as Bruno.Variable[], // To track variables from requests
    };

    items.forEach((item) => {
      if (item.type === "folder" || (item.items && item.items.length > 0)) {
        const id = generateDocumentId("apis");
        const subItems = item.items?.length
          ? processItems(item.items, id)
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
        result.apis.push(createApiRecord(item, parentCollectionId));
        if (item.request?.vars) {
          result.variables.push(...(item.request.vars.res || []), ...(item.request.vars.req || []));
        }
      }
    });

    return result;
  };

  const rootCollectionId = generateDocumentId("apis");
  const processedItems = processItems(fileContent.items, rootCollectionId);
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

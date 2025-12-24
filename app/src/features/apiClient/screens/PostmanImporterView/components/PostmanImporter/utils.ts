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
import { captureException } from "backend/apiClient/utils";
import Logger from "lib/logger";

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

// Unsupported features detection types
interface UnsupportedFeaturesMeta {
  vaultVars: string[];
  dynamicVars: string[];
  disabledVars: string[];
  unsupportedAuthTypes: string[];
  unsupportedScriptMethods: string[];
  requestExamplesCount: number;
  requestsWithExamples: string[];
  collectionLevelScriptCount: number;
  collectionsWithScripts: string[];
}

export type { UnsupportedFeaturesMeta };

interface EnvRefsResult {
  vaultVars: string[];
  dynamicVars: string[];
  hasVault: boolean;
  hasDynamic: boolean;
}

interface CollectionEnvRefsResult {
  vaultVars: string[];
  dynamicVars: string[];
  disabledCollectionVars: string[];
}

interface EnvironmentEnvRefsResult {
  vaultVars: string[];
  dynamicVars: string[];
  disabledEnvVars: string[];
}

// Regex patterns for env variable detection
const VAULT_REGEX = /\{\{\s*vault:([a-zA-Z0-9._-]+)\s*\}\}/g;
const DYNAMIC_VAR_REGEX = /\{\{\s*\$([a-zA-Z_][a-zA-Z0-9_]*)[^}]*\}\}/g;
const UNSUPPORTED_SCRIPT_METHODS = ["sendRequest", "cookies", "visualizer", "vault", "execution", "require"];
const UNSUPPORTED_SCRIPT_REGEX = new RegExp(`(?:pm|rq)\\.(${UNSUPPORTED_SCRIPT_METHODS.join("|")})\\b`, "g");

// Helper: Find matches in string with custom key extractor
const findMatches = (s: unknown, regex: RegExp, makeKey: (m: RegExpExecArray) => string): string[] => {
  if (!s || typeof s !== "string") return [];
  const out = new Set<string>();
  let m;
  const re = new RegExp(regex.source, regex.flags);
  while ((m = re.exec(s)) !== null) {
    out.add(makeKey(m));
  }
  return Array.from(out);
};

const findVaultRefsInString = (s?: string | null): string[] => findMatches(s, VAULT_REGEX, (m) => `vault:${m[1]}`);

const findDynamicVarsInString = (s?: string | null): string[] => findMatches(s, DYNAMIC_VAR_REGEX, (m) => `$${m[1]}`);

const findUnsupportedScriptsInString = (s?: string | null): string[] =>
  findMatches(s, UNSUPPORTED_SCRIPT_REGEX, (m) => `${m[1]}`);

const scanKVs = (kvs?: Array<{ value?: any }>): { vault: string[]; dynamic: string[] } => {
  const vault: string[] = [];
  const dynamic: string[] = [];
  (kvs || []).forEach((k) => {
    vault.push(...findVaultRefsInString(k?.value));
    dynamic.push(...findDynamicVarsInString(k?.value));
  });
  return { vault, dynamic };
};

const scanFormdata = (
  formdata?: Array<{ value?: any; src?: any; type?: string }>
): { vault: string[]; dynamic: string[] } => {
  const vault: string[] = [];
  const dynamic: string[] = [];
  (formdata || []).forEach((p) => {
    const fields = [p?.value, p?.src].filter((x) => typeof x === "string") as string[];
    fields.forEach((f) => {
      vault.push(...findVaultRefsInString(f));
      dynamic.push(...findDynamicVarsInString(f));
    });
  });
  return { vault, dynamic };
};

// Scanner: Find vault/dynamic variables in a single item (request)
export const scanItemForEnvRefs = (item: any): EnvRefsResult => {
  const vaultVars = new Set<string>();
  const dynamicVars = new Set<string>();

  const addVault = (arr: string[]) => arr.forEach((x) => (x ? vaultVars.add(x) : null));
  const addDynamic = (arr: string[]) => arr.forEach((x) => (x ? dynamicVars.add(x) : null));

  const req = item?.request;
  if (req) {
    const urlRaw = typeof req.url === "string" ? req.url : req.url?.raw;
    addVault(findVaultRefsInString(urlRaw));
    addDynamic(findDynamicVarsInString(urlRaw));

    const kvResult = scanKVs(req.url?.query);
    addVault(kvResult.vault);
    addDynamic(kvResult.dynamic);

    (req.header || []).forEach((h: any) => {
      addVault(findVaultRefsInString(h?.value));
      addDynamic(findDynamicVarsInString(h?.value));
    });

    const body = req.body;
    if (body) {
      if (body.mode === "raw") {
        addVault(findVaultRefsInString(body.raw));
        addDynamic(findDynamicVarsInString(body.raw));
      } else if (body.mode === "urlencoded") {
        const r = scanKVs(body.urlencoded);
        addVault(r.vault);
        addDynamic(r.dynamic);
      } else if (body.mode === "formdata") {
        const r = scanFormdata(body.formdata);
        addVault(r.vault);
        addDynamic(r.dynamic);
      } else if (body.mode === "graphql") {
        addVault(findVaultRefsInString(body.graphql?.query));
        addDynamic(findDynamicVarsInString(body.graphql?.query));
        const varsStr = body.graphql?.variables ? JSON.stringify(body.graphql.variables) : "";
        addVault(findVaultRefsInString(varsStr));
        addDynamic(findDynamicVarsInString(varsStr));
      }
    }
  }

  // Scripts
  (item?.event || []).forEach((ev: any) => {
    const script = ev?.script?.exec?.join("\n") || "";
    addVault(findVaultRefsInString(script));
    addDynamic(findDynamicVarsInString(script));
  });

  // Responses/examples
  (item?.response || []).forEach((resp: any) => {
    addVault(findVaultRefsInString(resp?.body));
    addDynamic(findDynamicVarsInString(resp?.body));
  });

  return {
    vaultVars: Array.from(vaultVars),
    dynamicVars: Array.from(dynamicVars),
    hasVault: vaultVars.size > 0,
    hasDynamic: dynamicVars.size > 0,
  };
};

// Scanner: Find vault/dynamic variables and disabled vars in collection
export const scanCollectionForEnvRefs = (fileContent: any): CollectionEnvRefsResult => {
  const vaultVars = new Set<string>();
  const dynamicVars = new Set<string>();
  const disabledCollectionVars: string[] = [];

  // Collection variables
  (fileContent?.variable || []).forEach((v: any) => {
    findVaultRefsInString(v?.value).forEach((x) => vaultVars.add(x));
    findDynamicVarsInString(v?.value).forEach((x) => dynamicVars.add(x));
    if (v?.disabled === true || v?.enabled === false) {
      disabledCollectionVars.push(v?.key);
    }
  });

  const walk = (items: any[]) => {
    (items || []).forEach((it) => {
      const r = scanItemForEnvRefs(it);
      r.vaultVars.forEach((x) => vaultVars.add(x));
      r.dynamicVars.forEach((x) => dynamicVars.add(x));
      if (it?.item?.length) walk(it.item);
    });
  };
  walk(fileContent?.item || []);

  return {
    vaultVars: Array.from(vaultVars),
    dynamicVars: Array.from(dynamicVars),
    disabledCollectionVars,
  };
};

// Scanner: Find vault/dynamic variables and disabled vars in environment
export const scanEnvironmentForEnvRefs = (env: any): EnvironmentEnvRefsResult => {
  const vaultVars = new Set<string>();
  const dynamicVars = new Set<string>();
  const disabledEnvVars: string[] = [];

  (env?.values || []).forEach((v: any) => {
    findVaultRefsInString(v?.value).forEach((x) => vaultVars.add(x));
    findDynamicVarsInString(v?.value).forEach((x) => dynamicVars.add(x));
    if (v?.enabled === false) disabledEnvVars.push(v?.key);
  });

  return {
    vaultVars: Array.from(vaultVars),
    dynamicVars: Array.from(dynamicVars),
    disabledEnvVars,
  };
};

// Main orchestrator: Detect all unsupported features in a collection
export const detectUnsupportedFeaturesInCollection = (
  fileContent: any,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): { unsupportedFeatures: string[]; meta: UnsupportedFeaturesMeta } => {
  const unsupportedFeatures = new Set<string>();
  const meta: UnsupportedFeaturesMeta = {
    vaultVars: [],
    dynamicVars: [],
    disabledVars: [],
    unsupportedAuthTypes: [],
    unsupportedScriptMethods: [],
    requestExamplesCount: 0,
    requestsWithExamples: [],
    collectionLevelScriptCount: 0,
    collectionsWithScripts: [],
  };

  // Scan for env refs
  const envRefs = scanCollectionForEnvRefs(fileContent);
  meta.vaultVars = envRefs.vaultVars;
  meta.dynamicVars = envRefs.dynamicVars;
  meta.disabledVars = envRefs.disabledCollectionVars;
  if (envRefs.vaultVars.length > 0) unsupportedFeatures.add("env_vault_reference");
  if (envRefs.dynamicVars.length > 0) unsupportedFeatures.add("env_dynamic_variable");
  if (envRefs.disabledCollectionVars.length > 0) unsupportedFeatures.add("env_variable_disabled_flag");

  // Scan for unsupported auth types and scripts
  const scanAuth = (auth: any) => {
    if (auth?.type && !(auth.type in POSTMAN_AUTH_TYPES_MAPPING)) {
      meta.unsupportedAuthTypes.push(auth.type);
      unsupportedFeatures.add(`auth_${auth.type}`);
    }
  };

  const scanScripts = (item: any) => {
    (item?.event || []).forEach((ev: any) => {
      const script = ev?.script?.exec?.join("\n") || "";
      const methods = findUnsupportedScriptsInString(script);
      methods.forEach((m) => {
        meta.unsupportedScriptMethods.push(m);
        unsupportedFeatures.add(`script_${m}`);
      });
    });
  };

  const trackRequestExamples = (item: any) => {
    if (Array.isArray(item?.response) && item.response.length > 0) {
      meta.requestExamplesCount += item.response.length;
      if (item?.name) {
        meta.requestsWithExamples.push(item.name);
      }
      unsupportedFeatures.add("request_examples");
    }
  };

  const trackCollectionLevelScripts = (node: any, name: string) => {
    const events = Array.isArray(node?.event) ? node.event : [];
    if (events.length > 0) {
      meta.collectionLevelScriptCount += events.length;
      if (name) {
        meta.collectionsWithScripts.push(name);
      }
      unsupportedFeatures.add("collection_level_scripts");
    }
  };

  const walk = (items: any[]) => {
    (items || []).forEach((it) => {
      if (it.request?.auth) scanAuth(it.request.auth);
      scanScripts(it);
      trackRequestExamples(it);
      if (it?.item?.length) {
        trackCollectionLevelScripts(it, it.name);
      }
      if (it?.item?.length) walk(it.item);
    });
  };

  if (fileContent.auth) scanAuth(fileContent.auth);
  // Track collection-level scripts on the root collection
  trackCollectionLevelScripts(fileContent, fileContent?.info?.name || "");
  walk(fileContent?.item || []);

  // Deduplicate
  meta.unsupportedAuthTypes = Array.from(new Set(meta.unsupportedAuthTypes));
  meta.unsupportedScriptMethods = Array.from(new Set(meta.unsupportedScriptMethods));
  meta.requestsWithExamples = Array.from(new Set(meta.requestsWithExamples));
  meta.collectionsWithScripts = Array.from(new Set(meta.collectionsWithScripts));

  return {
    unsupportedFeatures: Array.from(unsupportedFeatures),
    meta,
  };
};

// Main orchestrator: Detect all unsupported features in an environment
export const detectUnsupportedFeaturesInEnvironment = (
  fileContent: any
): {
  unsupportedFeatures: string[];
  meta: Omit<
    UnsupportedFeaturesMeta,
    | "unsupportedAuthTypes"
    | "unsupportedScriptMethods"
    | "requestExamplesCount"
    | "requestsWithExamples"
    | "collectionLevelScriptCount"
    | "collectionsWithScripts"
  >;
} => {
  const unsupportedFeatures = new Set<string>();
  const envRefs = scanEnvironmentForEnvRefs(fileContent);

  if (envRefs.vaultVars.length > 0) unsupportedFeatures.add("env_vault_reference");
  if (envRefs.dynamicVars.length > 0) unsupportedFeatures.add("env_dynamic_variable");
  if (envRefs.disabledEnvVars.length > 0) unsupportedFeatures.add("env_variable_disabled_flag");

  return {
    unsupportedFeatures: Array.from(unsupportedFeatures),
    meta: {
      vaultVars: envRefs.vaultVars,
      dynamicVars: envRefs.dynamicVars,
      disabledVars: envRefs.disabledEnvVars,
    },
  };
};

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
  // Detect unsupported features in environment
  const { unsupportedFeatures, meta } = detectUnsupportedFeaturesInEnvironment(fileContent);

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
    unsupportedFeatures,
    meta,
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

  try {
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
  } catch (error) {
    // Gracefully handle unsupported auth types by returning default auth
    Logger.log(`Error processing auth type "${item?.type}": ${error.message}`);
    return getDefaultAuth(parentCollectionId === null);
  }
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
    request.header?.map(
      (
        header: { key: string; value: string; disabled: boolean; type: string; description?: string },
        index: number
      ) => ({
        id: index,
        key: header.key,
        value: header.value,
        isEnabled: !header?.disabled,
        description: header?.description || "",
      })
    ) ?? [];

  return { headers };
};

const createApiRecord = (
  item: any,
  parentCollectionId: string,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): Partial<RQAPI.ApiRecord> => {
  try {
    const { request } = item;
    if (!request) throw new Error(`Invalid API item: ${item.name}`);

    const queryParams =
      request.url?.query?.map((query: any, index: number) => ({
        id: index,
        key: query.key,
        value: query.value,
        isEnabled: true,
        description: query.description || "",
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
  } catch (error) {
    // Log error but don't throw - allow import to continue with defaults
    Logger.log(`Error processing API item "${item.name}": ${error.message}`);
    captureException(error);

    // Return minimal valid record with defaults
    return {
      id: apiClientRecordsRepository.generateApiRecordId(parentCollectionId),
      collectionId: parentCollectionId,
      name: item.name || "Untitled Request",
      type: RQAPI.RecordType.API,
      deleted: false,
      data: {
        type: RQAPI.ApiEntryType.HTTP,
        request: {
          url: "",
          method: RequestMethod.GET,
          queryParams: [],
          headers: [],
          body: "",
          bodyContainer: createBodyContainer({ contentType: RequestContentType.RAW, body: "" }),
          contentType: RequestContentType.RAW,
        },
        response: null,
        auth: getDefaultAuth(parentCollectionId === null),
        scripts: { preRequest: "", postResponse: "" },
      },
    } as Partial<RQAPI.HttpApiRecord>;
  }
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
): {
  collections: Partial<RQAPI.CollectionRecord>[];
  apis: Partial<RQAPI.ApiRecord>[];
  unsupportedFeatures: string[];
  meta: UnsupportedFeaturesMeta;
} => {
  if (!fileContent.info?.name) {
    throw new Error("Invalid collection file: missing name");
  }

  // Detect unsupported features early
  const { unsupportedFeatures, meta } = detectUnsupportedFeaturesInCollection(fileContent, apiClientRecordsRepository);

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

        if (!subCollection.id) {
          const error = new Error(`Failed to generate collection ID for: ${item.name}`);
          captureException(error);
          return;
        }
        const subItems = processItems(item.item, subCollection.id);
        result.collections.push(...subItems.collections);
        result.apis.push(...subItems.apis);
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
    unsupportedFeatures,
    meta,
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

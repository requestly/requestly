import { RQAPI, RequestMethod, RequestContentType } from "features/apiClient/types";
import { ApiClientRecordsInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";
import { getDefaultAuth } from "features/apiClient/screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";
import { createBodyContainer } from "features/apiClient/screens/apiClient/utils";

export const fetchOpenApiSpec = async (url: string) => {
  try {
    let targetUrl = url;
    // If user provided /docs, change to /openapi.json
    if (targetUrl.endsWith("/docs")) {
      targetUrl = targetUrl.replace(/\/docs$/, "/openapi.json");
    } else if (targetUrl.endsWith("/docs/")) {
      targetUrl = targetUrl.replace(/\/docs\/$/, "/openapi.json");
    } else if (!targetUrl.endsWith("/openapi.json")) {
      // Try appending /openapi.json if no specific path was given
      targetUrl = targetUrl.replace(/\/$/, "") + "/openapi.json";
    }

    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec from ${targetUrl}`);
    }
    const data = await response.json();
    return { data, targetUrl };
  } catch (error: any) {
    throw new Error(`Could not fetch OpenAPI spec: ${error.message}`);
  }
};

const createCollectionRecord = (
  name: string,
  id: string,
  description: string = ""
): Partial<RQAPI.CollectionRecord> => {
  return {
    id,
    name,
    description,
    deleted: false,
    data: {
      variables: {},
      auth: getDefaultAuth(true),
    },
    type: RQAPI.RecordType.COLLECTION,
    collectionId: "", // root collection
  };
};

export const processOpenApiData = (
  fileContent: any,
  baseUrl: string,
  collectionName: string,
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<string, any>>
): { collections: Partial<RQAPI.CollectionRecord>[]; apis: Partial<RQAPI.ApiRecord>[] } => {
  if (!fileContent || !fileContent.paths) {
    throw new Error("Invalid OpenAPI schema");
  }

  const rootCollectionId = apiClientRecordsRepository.generateCollectionId(collectionName);
  const rootCollection = createCollectionRecord(collectionName, rootCollectionId, fileContent.info?.description || "");

  const apis: Partial<RQAPI.HttpApiRecord>[] = [];

  // Parse paths
  for (const [path, methods] of Object.entries(fileContent.paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const httpMethod = method.toUpperCase() as RequestMethod;

      // Determine request body and content type
      let requestBody = "";
      let contentType = RequestContentType.JSON;

      if (details.requestBody && details.requestBody.content) {
        const contentTypes = Object.keys(details.requestBody.content);
        if (contentTypes.includes("application/json")) {
          contentType = RequestContentType.JSON;
          const schema = details.requestBody.content["application/json"].schema;
          if (schema && schema.example) {
            requestBody = typeof schema.example === "object" ? JSON.stringify(schema.example, null, 2) : schema.example;
          } else {
            requestBody = "{}"; // default empty json
          }
        } else if (contentTypes.includes("application/x-www-form-urlencoded")) {
          contentType = RequestContentType.FORM;
          requestBody = "[]";
        } else if (contentTypes.includes("multipart/form-data")) {
          contentType = RequestContentType.MULTIPART_FORM;
          requestBody = "[]";
        }
      }

      // Query params
      const queryParams: any[] = [];
      const headers: any[] = [];

      if (details.parameters) {
        details.parameters.forEach((param: any, index: number) => {
          if (param.in === "query") {
            queryParams.push({
              id: index,
              key: param.name,
              value: param.schema?.default || "",
              isEnabled: param.required || false,
              description: param.description || "",
              dataType: "string",
            });
          } else if (param.in === "header") {
            headers.push({
              id: index,
              key: param.name,
              value: param.schema?.default || "",
              isEnabled: param.required || false,
              description: param.description || "",
              dataType: "string",
            });
          }
        });
      }

      const apiRecordId = apiClientRecordsRepository.generateApiRecordId(rootCollectionId);

      const fullUrl = baseUrl.replace(/\/openapi\.json$/, "") + path;

      apis.push({
        id: apiRecordId,
        collectionId: rootCollectionId,
        name: details.summary || `${httpMethod} ${path}`,
        type: RQAPI.RecordType.API,
        deleted: false,
        data: {
          type: RQAPI.ApiEntryType.HTTP,
          request: {
            url: fullUrl,
            method: httpMethod,
            queryParams,
            headers,
            body: requestBody,
            bodyContainer: createBodyContainer({ contentType, body: requestBody }),
            contentType,
          },
          response: null,
          auth: getDefaultAuth(false),
          scripts: { preRequest: "", postResponse: "" },
        },
      });
    }
  }

  // Generate ranks for APIs
  const ranks = apiRecordsRankingManager.getNextRanks(apis, apis);

  return {
    collections: [rootCollection],
    apis: apis.map((api, index) => {
      api.rank = ranks[index];
      return api;
    }),
  };
};

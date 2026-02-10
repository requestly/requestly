import { RQAPI } from "@requestly/shared/types/entities/apiClient";
import { stringify as yamlStringify } from "yaml";
import { openApiExporter } from "@requestly/alternative-importers";
import { ExporterFunction, ExportResult } from "../types";
import * as Sentry from "@sentry/react";
import { wrapWithCustomSpan } from "utils/sentry";
import { SPAN_STATUS_ERROR, SPAN_STATUS_OK } from "@sentry/core";

/**
 * Creates an OpenAPI exporter function for a given collection or array of records
 */
export const createOpenApiExporter = (collectionRecord: RQAPI.CollectionRecord): ExporterFunction => {
  return (): ExportResult => {
    return wrapWithCustomSpan(
      {
        name: "[Transaction] api_client.openapi_export.convert_data",
        op: "api_client.openapi_export.convert_data",
        forceTransaction: true,
        attributes: {},
      },
      () => {
        try {
          // The exporter now returns both JSON and YAML formats with metadata
          const openapiExport = openApiExporter(collectionRecord);
          const sanitizedName = collectionRecord.name.replace(/[^a-z0-9]/gi, "-");

          const jsonExport = new Blob([JSON.stringify(openapiExport, null, 2)], { type: "application/json" });
          const yamlExport = new Blob([yamlStringify(openapiExport)], { type: "application/x-yaml" });

          const pathCount = Object.keys(openapiExport.paths || {}).length;
          const serverCount = openapiExport.servers?.length || 0;
          const securitySchemeCount = Object.keys(openapiExport.components?.securitySchemes || {}).length;

          const exportResult: ExportResult = {
            files: [
              {
                fileName: `${sanitizedName}.json`,
                content: jsonExport,
                type: "application/json",
              },
              {
                fileName: `${sanitizedName}.yaml`,
                content: yamlExport,
                type: "application/x-yaml",
              },
            ],
            metadata: [
              { key: "Paths", value: pathCount },
              { key: "Servers", value: serverCount },
              { key: "Security Schemes", value: securitySchemeCount },
            ],
          };

          Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_OK });

          return exportResult;
        } catch (error) {
          const inputSummary = {
            collectionId: collectionRecord.id,
            childrenIds: collectionRecord.data.children?.map((child) => child.id) || [],
          };
          Sentry.captureException(error, {
            extra: { input: inputSummary },
          });

          Sentry.getActiveSpan()?.setStatus({ code: SPAN_STATUS_ERROR });

          throw error;
        }
      }
    )();
  };
};

import { Authorization, RQAPI } from "@requestly/shared/types/entities/apiClient";
import { openApiExporter } from "@requestly/alternative-importers";
import {
  ExporterFunction,
  ExportResult,
} from "features/apiClient/screens/apiClient/components/modals/CommonApiClientExportModal";
import * as Sentry from "@sentry/react";

/**
 * Creates an OpenAPI exporter function for a given collection or array of records
 */
export const createOpenApiExporter = (input: RQAPI.CollectionRecord | RQAPI.ApiClientRecord[]): ExporterFunction => {
  return async (): Promise<ExportResult> => {
    try {
      let collectionToExport: RQAPI.CollectionRecord;

      // Check if input is a single collection or an array of records
      if (Array.isArray(input)) {
        // Create a dummy collection from the array of records
        const dummyCollection: RQAPI.CollectionRecord = {
          id: `rq-collection-${Date.now()}`,
          name: "Requestly Collection",
          description: "Exported from Requestly API Client",
          type: RQAPI.RecordType.COLLECTION,
          collectionId: null,
          deleted: false,
          data: {
            children: [],
            variables: {},
            auth: {
              currentAuthType: Authorization.Type.INHERIT,
              authConfigStore: {},
            },
          },
          createdTs: Date.now(),
          updatedTs: Date.now(),
          ownerId: "",
          createdBy: "",
          updatedBy: "",
        };

        dummyCollection.data.children = input;
        collectionToExport = dummyCollection;
      } else {
        // Input is already a single collection, use it directly
        collectionToExport = input;
      }

      // The exporter now returns both JSON and YAML formats with metadata
      const result = openApiExporter(collectionToExport);
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          input,
        },
      });
      throw error;
    }
  };
};

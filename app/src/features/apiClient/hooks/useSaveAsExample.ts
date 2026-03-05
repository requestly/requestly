import { useTabActions } from "componentsV2/Tabs/slice";
import { createExampleRequest, useApiClientFeatureContext } from "../slices";
import { useCallback, useState } from "react";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "../slices/entities";
import { RQAPI } from "../types";
import { ExampleViewTabSource } from "../screens/apiClient/components/views/components/ExampleRequestView/exampleViewTabSource";
import { toast } from "utils/Toast";
import { sessionStorage } from "utils/sessionStorage";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "../constants";
import { EXPANDED_RECORD_IDS_UPDATED } from "../slices/exampleCollections";
import { sanitizeExampleMultiPartFormBody } from "../screens/apiClient/utils";

export const useSaveAsExample = (entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity) => {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const handleSaveExample = useCallback(async () => {
    const log = (msg: string, data?: unknown) => {
      console.log(`[useSaveAsExample] ${msg}`, data !== undefined ? data : "");
    };
    try {
      log("handleSaveExample called", { referenceId: entity.meta.referenceId });
      setIsSavingAsExample(true);
      const requestRecord = entity.getEntityFromState(context.store.getState());
      log("requestRecord from state", requestRecord);
      const { data, ...recordMeta } = requestRecord;
      const { examples: _examples, ...entryData } = data;
      const sanitizedEntryData =
        entryData?.type === RQAPI.ApiEntryType.HTTP
          ? sanitizeExampleMultiPartFormBody(entryData as RQAPI.HttpApiEntry)
          : entryData;
      log("sanitizedEntryData", sanitizedEntryData);
      const exampleRecordToCreate: RQAPI.ExampleApiRecord = {
        ...recordMeta,
        data: sanitizedEntryData,
        parentRequestId: entity.meta.referenceId,
        type: RQAPI.RecordType.EXAMPLE_API,
        collectionId: null,
      };
      log("exampleRecordToCreate", exampleRecordToCreate);

      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: entity.meta.referenceId,
            example: exampleRecordToCreate,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      log("example created", exampleRecord);

      openBufferedTab({
        preview: false,
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          title: exampleRecord.name || "Example",
          apiEntryDetails: exampleRecord,
          context: { id: context.workspaceId },
        }),
      });
      log("opened buffered tab for example", { id: exampleRecord.id, name: exampleRecord.name });

      const parentRequestId = entity.meta.referenceId;
      if (parentRequestId) {
        const existingExpanded = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);
        if (!existingExpanded.includes(parentRequestId)) {
          sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [...existingExpanded, parentRequestId]);
          window.dispatchEvent(new CustomEvent(EXPANDED_RECORD_IDS_UPDATED));
          log("expanded parent in session storage", { parentRequestId });
        }
      }

      toast.success("Example created successfully.");
      log("save complete");
    } catch (error) {
      console.log("[useSaveAsExample] Error saving example", error);
      toast.error("Something went wrong while creating the example.");
    } finally {
      setIsSavingAsExample(false);
      log("isSavingAsExample set to false");
    }
  }, [context, entity, openBufferedTab]);

  return {
    isSavingAsExample,
    handleSaveExample,
  };
};

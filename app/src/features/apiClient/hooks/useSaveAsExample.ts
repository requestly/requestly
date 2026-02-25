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

export const useSaveAsExample = (entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity) => {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const handleSaveExample = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const requestRecord = entity.getEntityFromState(context.store.getState());
      const exampleRecordToCreate: RQAPI.ExampleApiRecord = {
        ...requestRecord,
        parentRequestId: entity.meta.referenceId,
        type: RQAPI.RecordType.EXAMPLE_API,
      };
      exampleRecordToCreate.collectionId = null;

      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: entity.meta.referenceId,
            example: exampleRecordToCreate,
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      openBufferedTab({
        preview: false,
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          title: exampleRecord.name || "Example",
          apiEntryDetails: exampleRecord,
          context: { id: context.workspaceId },
        }),
      });

      const parentRequestId = entity.meta.referenceId;
      if (parentRequestId) {
        const existingExpanded = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);
        if (!existingExpanded.includes(parentRequestId)) {
          sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [...existingExpanded, parentRequestId]);
          window.dispatchEvent(new CustomEvent(EXPANDED_RECORD_IDS_UPDATED));
        }
      }

      toast.success("Example created successfully.");
    } catch (error) {
      toast.error("Something went wrong while creating the example.");
    } finally {
      setIsSavingAsExample(false);
    }
  }, [context, entity, openBufferedTab]);

  return {
    isSavingAsExample,
    handleSaveExample,
  };
};

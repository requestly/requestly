import { useTabActions } from "componentsV2/Tabs/slice";
import { createExampleRequest, useApiClientFeatureContext } from "../slices";
import { useCallback, useState } from "react";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "../slices/entities";
import { RQAPI } from "../types";
import { ExampleViewTabSource } from "../screens/apiClient/components/views/components/ExampleRequestView/exampleViewTabSource";
import { toast } from "utils/Toast";

export const useSaveAsExample = (entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity) => {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();

  const [isSavingAsExample, setIsSavingAsExample] = useState(false);

  const handleSaveExample = useCallback(async () => {
    try {
      setIsSavingAsExample(true);
      const requestRecord = entity.getEntityFromState(context.store.getState());
      const { data, ...recordMeta } = requestRecord;
      const { examples: _examples, ...entryData } = data;
      const exampleRecordToCreate: RQAPI.ExampleApiRecord = {
        ...recordMeta,
        data: entryData,
        parentRequestId: entity.meta.referenceId,
        type: RQAPI.RecordType.EXAMPLE_API,
        collectionId: null,
      };

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

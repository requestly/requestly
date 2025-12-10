import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { Authorization } from "../../views/components/request/components/AuthorizationView/types/AuthConfig";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { moveRecordsAcrossWorkspace } from "features/apiClient/commands/records";

export async function createNewCollection(context: ApiClientFeatureContext, collectionName: string) {
  const collectionToBeCreated: Partial<RQAPI.CollectionRecord> = {
    collectionId: "",
    name: collectionName,
    type: RQAPI.RecordType.COLLECTION,
    deleted: false,
    data: {
      variables: {},
      auth: {
        currentAuthType: Authorization.Type.NO_AUTH,
        authConfigStore: {},
      },
    },
  };

  const { apiClientRecordsRepository } = context.repositories;
  const newCollection = await apiClientRecordsRepository.createCollection(collectionToBeCreated);

  if (!newCollection.success || !newCollection.data) {
    throw new Error("Failed to create a new collection");
  }

  return newCollection.data.id;
}

export async function moveRecordsToCollection(params: {
  contextId: string;
  recordsToMove: RQAPI.ApiClientRecord[];
  collectionId: string;
  destinationContextId: string;
}) {
  const { contextId, recordsToMove, collectionId, destinationContextId } = params;

  try {
    const currentContext = getApiClientFeatureContext(contextId);
    await moveRecordsAcrossWorkspace(currentContext, {
      recordsToMove,
      destination: { collectionId, contextId: destinationContextId },
    });
  } catch (error) {
    throw new Error("Failed to move some requests to collection");
  }
}

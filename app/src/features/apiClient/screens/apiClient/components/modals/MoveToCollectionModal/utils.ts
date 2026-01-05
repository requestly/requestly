import { RQAPI } from "features/apiClient/types";
import { Authorization } from "../../views/components/request/components/AuthorizationView/types/AuthConfig";
import { ApiClientFeatureContext } from "features/apiClient/slices";

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

  if (!newCollection.success) {
    throw new Error("Failed to create a new collection");
  }

  return newCollection.data.id;
}

import * as Sentry from "@sentry/react";
import { EnvironmentVariables } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { Timestamp } from "firebase/firestore";

export function patchMissingIdInVariables(variables: EnvironmentVariables): EnvironmentVariables {
  return Object.fromEntries(
    Object.entries(variables).map(([key, value], index) => {
      return [
        key,
        {
          ...value,
          id: index,
        },
      ];
    })
  );
}

export const updateRecordMetaData = (record: RQAPI.ApiClientRecord) => {
  const recordState = { ...record };
  recordState.createdTs = Timestamp.now().toMillis();
  recordState.updatedTs = Timestamp.now().toMillis();

  return recordState;
};

export function captureException(e: any) {
  Sentry.captureException(e, {
    tags: {
      alert: true,
    },
  });
}

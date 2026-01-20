import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import HttpClientView from "./HttpClientView";
import { getEmptyApiEntry } from "../../../utils";
import { createDummyApiRecord } from "features/apiClient/components/common/APIClient/APIClient";

type BaseProps = {
  openInModal?: boolean;
  onSaveCallback: (apiEntryDetails: RQAPI.HttpApiRecord) => void;
  notifyApiRequestFinished: (apiEntry: RQAPI.HttpApiEntry) => void;
};

type CreateModeProps = BaseProps & {
  apiEntryDetails:
    | null
    | ({
        data: RQAPI.HttpApiEntry; // If you want to prefill the details then only data can be passed in create mode
      } & Partial<RQAPI.HttpApiRecord>);
};

export const HttpClientViewCreateMode: React.FC<CreateModeProps> = (props) => {
  const createdApiEntryDetails: RQAPI.HttpApiRecord = useMemo(() => {
    if (!props.apiEntryDetails) {
      return createDummyApiRecord(getEmptyApiEntry(RQAPI.ApiEntryType.HTTP)) as RQAPI.HttpApiRecord;
    }

    return props.apiEntryDetails as RQAPI.HttpApiRecord;
  }, [props.apiEntryDetails]);

  return <HttpClientView {...props} isCreateMode={true} apiEntryDetails={createdApiEntryDetails} />;
};

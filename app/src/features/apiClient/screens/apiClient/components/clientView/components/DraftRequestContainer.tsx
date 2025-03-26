import React, { useCallback, useState } from "react";
import { RequestView } from "./RequestContainer";
import { DraftRequestView } from "./DraftRequestView";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";
import { RQAPI } from "features/apiClient/types";
import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";

//TODO: losing focus in the apiClientViewer on first focus
type RequestDetails =
  | {
      entryDetails: RQAPI.ApiRecord;
      isCreateMode: false;
    }
  | {
      isCreateMode: true;
    };

export const DraftRequestContainer: React.FC = () => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    isCreateMode: true,
  });

  const { setTitle, setUrl } = useGenericState();

  const onSaveCallback = useCallback(
    (apiEntryDetails: RQAPI.ApiRecord) => {
      setRequestDetails({
        isCreateMode: false,
        entryDetails: apiEntryDetails,
      });
      setTitle(apiEntryDetails.name);
      setUrl(`${PATHS.API_CLIENT.ABSOLUTE}/request/${apiEntryDetails.id}`);
    },
    [setTitle, setUrl]
  );

  if (requestDetails.isCreateMode === true) {
    return <DraftRequestView onSaveCallback={onSaveCallback} />;
  } else {
    return <RequestView apiEntryDetails={requestDetails.entryDetails} />;
  }
};
export class DraftRequestContainerSource extends AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: Record<string, any>;
  urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/request/new`;

  constructor(metadata: Record<string, any>) {
    super();
    this.component = <DraftRequestContainer />;
    this.metadata = {
      id: Date.now(),
      name: "New Request",
      title: metadata.title,
    };
  }

  getSourceId(): string {
    return this.metadata.id;
  }

  getSourceName(): string {
    return this.metadata.name;
  }

  render(): React.ReactNode {
    return this.component;
  }

  getDefaultTitle(): string {
    return this.metadata.title;
  }

  getUrlPath(): string {
    return this.urlPath;
  }

  setUrlPath(path: string) {
    this.urlPath = path;
  }
}

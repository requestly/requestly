import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { RequestView } from "./RequestView";
import { RQAPI } from "features/apiClient/types";

interface RequestViewTabSourceMetadata {
  apiEntryDetails: RQAPI.ApiRecord;
  title: string;
}

export class RequestViewTabSource extends BaseTabSource {
  constructor(metadata: RequestViewTabSourceMetadata) {
    super();
    this.component = <RequestView apiEntryDetails={metadata.apiEntryDetails} />;
    this.metadata = {
      id: metadata.apiEntryDetails.id,
      name: "request",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${this.metadata.id}`;
  }

  static create(metadata: RequestViewTabSourceMetadata): RequestViewTabSource {
    if (!metadata.title) {
      throw new Error("Request title not found!");
    }

    if (!metadata.apiEntryDetails) {
      throw new Error("Entry details not found!");
    }

    return new RequestViewTabSource(metadata);
  }
}

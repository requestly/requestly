import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { RequestView } from "./RequestView";
import { RQAPI } from "features/apiClient/types";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";

interface RequestViewTabSourceMetadata extends TabSourceMetadata {
  apiEntryDetails?: RQAPI.ApiRecord;
}

export class RequestViewTabSource extends BaseTabSource {
  constructor(metadata: RequestViewTabSourceMetadata) {
    super();
    this.component = (
      <RequestView key={metadata.id} requestId={metadata.id} apiEntryDetails={metadata.apiEntryDetails} />
    );
    this.metadata = {
      id: metadata.id,
      name: "request",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdOutlineSyncAlt />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): RequestViewTabSource {
    const { requestId } = matchedPath.params;

    if (!requestId) {
      throw new Error("Request id not found!");
    }

    return new RequestViewTabSource({ id: requestId, title: "Request" });
  }
}

import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { RequestView } from "./RequestView";
import { RQAPI } from "features/apiClient/types";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { ReactNode } from "react";
import { getApiClientFeatureContext } from "features/apiClient/slices";

interface RequestViewTabSourceMetadata extends TabSourceMetadata {
  apiEntryDetails?: RQAPI.ApiRecord;
}

export class RequestViewTabSource extends BaseTabSource {
  constructor(metadata: RequestViewTabSourceMetadata) {
    super();
    this.component = <RequestView key={metadata.id} requestId={metadata.id} />;
    this.metadata = {
      ...metadata,
      name: "request",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = metadata.apiEntryDetails?.data.type ? this.getTabIcon(metadata.apiEntryDetails.data.type) : null;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): RequestViewTabSource {
    const { requestId } = matchedPath.params;
    const ctx = getApiClientFeatureContext();

    if (!requestId) {
      throw new Error("Request id not found!");
    }

    return new RequestViewTabSource({ id: requestId, title: "Request", context: { id: ctx.workspaceId } });
  }

  private getTabIcon(type: RQAPI.ApiEntryType): ReactNode {
    switch (type) {
      case RQAPI.ApiEntryType.HTTP:
        return <MdOutlineSyncAlt />;
      case RQAPI.ApiEntryType.GRAPHQL:
        return <GrGraphQl />;
      default:
        return <MdOutlineSyncAlt />;
    }
  }
}

import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { RequestView } from "./RequestView";
import { RQAPI } from "features/apiClient/types";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { ReactNode } from "react";
import { getApiClientRecordsStore } from "features/apiClient/commands/store.utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

interface RequestViewTabSourceMetadata extends TabSourceMetadata {
  apiEntryDetails?: RQAPI.ApiRecord;
}

function Record(props: { id: string }) {
  return <>Record {props.id}</>;
}

export class RequestViewTabSource extends BaseTabSource {
  constructor(metadata: RequestViewTabSourceMetadata) {
    super();
    this.component = (
      // <Record id={metadata.id} />
      <RequestView key={metadata.id} requestId={metadata.id} apiEntryDetails={metadata.apiEntryDetails} />
    );
    this.metadata = {
      ...metadata,
      name: "request",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = metadata.apiEntryDetails?.data.type ? this.getTabIcon(metadata.apiEntryDetails.data.type) : null;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): RequestViewTabSource {
    const { requestId } = matchedPath.params;

    if (!requestId) {
      throw new Error("Request id not found!");
    }

    return new RequestViewTabSource({ id: requestId, title: "Request", context: {} });
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

  getIsValidTab(context: ApiClientFeatureContext): boolean {
    const store = getApiClientRecordsStore(context);
    const isExist = store.getState().getData(this.metadata.id);
    return !!isExist;
  }
}

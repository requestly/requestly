import { ReactNode } from "react";
import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "./DraftRequestContainer";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { TabSourceMetadata } from "componentsV2/Tabs/types";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";
import { apiClientContextRegistry, getApiClientFeatureContext } from "features/apiClient/slices";

interface DraftRequestContainerTabSourceMetadata extends TabSourceMetadata {
  emptyRecord: RQAPI.ApiRecord;
  apiEntryType?: RQAPI.ApiEntryType;
}

export class DraftRequestContainerTabSource extends BaseTabSource {
  metadata: DraftRequestContainerTabSourceMetadata;
  constructor(metadata: Pick<DraftRequestContainerTabSourceMetadata, "emptyRecord" | "apiEntryType" | "context">) {
    super();
    this.metadata = {
      id: `${Date.now()}`,
      name: "request",
      title: "Untitled request",
      isNewTab: true,
      ...metadata,
      context: {
        id: apiClientContextRegistry.getLastUsedContext()?.workspaceId,
        ...metadata.context,
      },
    };
    this.component = (
      <DraftRequestContainer
        key={this.metadata.id}
        draftId={this.metadata.id}
        apiEntryType={metadata?.apiEntryType ?? RQAPI.ApiEntryType.HTTP}
      />
    );
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/new`;
    this.icon = this.getTabIcon(
      (this.metadata as DraftRequestContainerTabSourceMetadata).apiEntryType ?? RQAPI.ApiEntryType.HTTP
    );
  }

  static create(metadata?: DraftRequestContainerTabSourceMetadata): DraftRequestContainerTabSource {
    const apiEntryType = metadata?.apiEntryType ?? RQAPI.ApiEntryType.HTTP;
    const ctx = getApiClientFeatureContext();
    return new DraftRequestContainerTabSource({
      apiEntryType,
      emptyRecord: getEmptyDraftApiRecord(apiEntryType),
      context: {
        id: ctx.workspaceId,
      },
    });
  }

  setUrlPath(path: string) {
    this.urlPath = path;
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

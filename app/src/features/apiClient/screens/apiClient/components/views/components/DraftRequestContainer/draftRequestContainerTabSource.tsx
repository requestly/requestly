import { ReactNode } from "react";
import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "./DraftRequestContainer";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { TabSourceMetadata } from "componentsV2/Tabs/types";

interface DraftRequestContainerTabSourceMetadata extends Partial<TabSourceMetadata> {
  apiEntryType?: RQAPI.ApiEntryType;
}

export class DraftRequestContainerTabSource extends BaseTabSource {
  constructor(metadata?: DraftRequestContainerTabSourceMetadata) {
    super();
    this.metadata = {
      id: `${Date.now()}`,
      name: "request",
      title: "Untitled request",
      context: {},
      isNewTab: true,
      ...metadata,
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
    return new DraftRequestContainerTabSource({ apiEntryType: metadata?.apiEntryType ?? RQAPI.ApiEntryType.HTTP });
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

  getIsValidTab(): boolean {
    return true; // Always a valid tab, on reload we get new draft tab
  }
}

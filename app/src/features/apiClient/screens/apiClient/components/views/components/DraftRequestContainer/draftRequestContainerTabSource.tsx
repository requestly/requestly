import { ReactNode } from "react";
import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "./DraftRequestContainer";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { RQAPI } from "features/apiClient/types";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";

export class DraftRequestContainerTabSource extends BaseTabSource {
  constructor(apiEntryType: RQAPI.ApiEntryType) {
    super();
    this.metadata = {
      id: `${Date.now()}`,
      name: "request",
      title: "Untitled request",
    };
    this.component = (
      <DraftRequestContainer key={this.metadata.id} draftId={this.metadata.id} apiEntryType={apiEntryType} />
    );
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/new`;
    this.icon = this.getTabIcon(apiEntryType);
  }

  static create(apiEntryType: RQAPI.ApiEntryType): DraftRequestContainerTabSource {
    return new DraftRequestContainerTabSource(apiEntryType);
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

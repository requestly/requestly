import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "./DraftRequestContainer";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";

export class DraftRequestContainerTabSource extends BaseTabSource {
  constructor() {
    super();
    this.metadata = {
      id: `${Date.now()}`,
      name: "request",
      title: "Untitled request",
    };
    this.component = <DraftRequestContainer key={this.metadata.id} draftId={this.metadata.id} />;
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/new`;
    this.icon = <MdOutlineSyncAlt />;
  }

  static create(): DraftRequestContainerTabSource {
    return new DraftRequestContainerTabSource();
  }

  setUrlPath(path: string) {
    this.urlPath = path;
  }
}

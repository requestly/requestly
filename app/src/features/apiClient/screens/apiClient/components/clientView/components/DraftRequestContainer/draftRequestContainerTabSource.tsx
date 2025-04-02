import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "./DraftRequestContainer";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";

export class DraftRequestContainerTabSource extends BaseTabSource {
  constructor() {
    super();
    this.component = <DraftRequestContainer />;
    this.metadata = {
      id: Date.now(),
      name: "request",
      title: "Untitled request",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/new`;
  }

  static create(): DraftRequestContainerTabSource {
    return new DraftRequestContainerTabSource();
  }

  setUrlPath(path: string) {
    this.urlPath = path;
  }
}

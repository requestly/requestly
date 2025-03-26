import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { EnvironmentView } from "./EnvironmentView";
import PATHS from "config/constants/sub/paths";

export class DraftRequestContainerSource extends BaseTabSource {
  constructor(metadata: Record<string, any>) {
    super();
    this.component = <EnvironmentView />;
    this.metadata = {
      id: metadata.id,
      name: "environment",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${this.metadata.id}`;
  }
}

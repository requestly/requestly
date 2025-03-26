import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { EnvironmentView } from "./EnvironmentView";
import PATHS from "config/constants/sub/paths";

interface EnvironmentViewTabSourceMetadata {
  id: string;
  title: string;
}

export class EnvironmentViewTabSource extends BaseTabSource {
  constructor(metadata: EnvironmentViewTabSourceMetadata) {
    super();
    this.component = <EnvironmentView />;
    this.metadata = {
      id: metadata.id,
      name: "environment",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${this.metadata.id}`;
  }

  static create(metadata: EnvironmentViewTabSourceMetadata): EnvironmentViewTabSource {
    if (!metadata.id) {
      throw new Error("Environment id not found!");
    }

    if (!metadata.title) {
      throw new Error("Environment title not found!");
    }

    return new EnvironmentViewTabSource(metadata);
  }
}

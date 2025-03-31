import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { EnvironmentView } from "./EnvironmentView";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource } from "componentsV2/Tabs/types";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";

interface EnvironmentViewTabSourceMetadata {
  id: string;
  title: string;
}

export class EnvironmentViewTabSource extends BaseTabSource {
  constructor(metadata: EnvironmentViewTabSourceMetadata) {
    super();
    this.component = <EnvironmentView key={metadata.id} envId={metadata.id} />;
    this.metadata = {
      id: metadata.id,
      name: "environment",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdHorizontalSplit />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): EnvironmentViewTabSource {
    const { envId } = matchedPath.params;

    if (!envId) {
      throw new Error("Environment id not found!");
    }

    return new EnvironmentViewTabSource({ id: envId, title: "Environment" });
  }
}

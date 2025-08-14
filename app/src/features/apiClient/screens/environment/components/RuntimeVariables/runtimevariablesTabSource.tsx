import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import PATHS from "config/constants/sub/paths";
import { RuntimeVariablesView } from "./RuntimeVariablesView/runtimevariablesview";

export class RuntimeVariablesViewTabSource extends BaseTabSource {
  //FIXME: Add the view component here
  constructor(metadata: TabSourceMetadata) {
    super();
    this.component = <RuntimeVariablesView key={metadata.id} varId={metadata.id} />;
    this.metadata = {
      ...metadata,
      name: "runtime_variables",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdHorizontalSplit />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): RuntimeVariablesViewTabSource {
    const { varId } = matchedPath.params;

    if (!varId) {
      //FIX: Error message
      throw new Error("runtime variables not found");
    }
    return new RuntimeVariablesViewTabSource({ id: varId, title: "Runtime Variables", context: {} });
  }
}

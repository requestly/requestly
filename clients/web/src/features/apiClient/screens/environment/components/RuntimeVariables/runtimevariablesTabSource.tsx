import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { RuntimeVariablesView } from "./RuntimeVariablesView/runtimevariablesview";
import { MatchedTabSource } from "componentsV2/Tabs/types";
import PATHS from "config/constants/sub/paths";
import { MdOutlineSpaceDashboard } from "@react-icons/all-files/md/MdOutlineSpaceDashboard";

export class RuntimeVariablesViewTabSource extends BaseTabSource {
  constructor() {
    super();
    this.component = <RuntimeVariablesView />;
    this.metadata = {
      id: "runtime",
      name: "runtime",
      title: "Runtime Variables",
      context: {},
    };
    this.urlPath = `${PATHS.API_CLIENT.VARIABLES.ABSOLUTE}/${this.metadata.name}`;
    this.icon = <MdOutlineSpaceDashboard />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): RuntimeVariablesViewTabSource {
    return new RuntimeVariablesViewTabSource();
  }

  getIsValidTab(): boolean {
    return true;
  }
}

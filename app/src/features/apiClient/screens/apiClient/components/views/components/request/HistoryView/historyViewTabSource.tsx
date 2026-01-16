import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource } from "componentsV2/Tabs/types";
import { HistoryView } from "./HistoryView";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";

export class HistoryViewTabSource extends BaseTabSource {
  constructor() {
    super();
    this.component = <HistoryView />;
    this.metadata = {
      id: "history",
      name: "history",
      title: "History",
      context: {},
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}`;
    this.icon = <MdOutlineHistory />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): HistoryViewTabSource {
    return new HistoryViewTabSource();
  }
}

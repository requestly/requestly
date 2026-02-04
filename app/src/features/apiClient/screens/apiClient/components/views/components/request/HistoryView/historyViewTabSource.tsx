import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { HistoryView } from "./HistoryView";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { RQAPI } from "features/apiClient/types";
import { createDummyApiRecord } from "features/apiClient/components/common/APIClient/APIClient";
import { getEmptyApiEntry } from "features/apiClient/screens/apiClient/utils";

interface HistoryViewTabSourceMetadata extends TabSourceMetadata {
  record?: RQAPI.ApiRecord;
  entryType?: RQAPI.ApiEntryType;
}

export class HistoryViewTabSource extends BaseTabSource {
  metadata: HistoryViewTabSourceMetadata;

  constructor(metadata: Pick<HistoryViewTabSourceMetadata, "context" | "record" | "entryType">) {
    super();
    this.component = <HistoryView />;
    this.metadata = {
      id: "history",
      name: "history",
      title: "History",
      ...metadata,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}`;
    this.icon = <MdOutlineHistory />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): HistoryViewTabSource {
    const ctx = getApiClientFeatureContext();
    const entryType = RQAPI.ApiEntryType.HTTP;
    const emptyEntry = getEmptyApiEntry(entryType);
    const record = createDummyApiRecord(emptyEntry);
    record.id = ""; // Override to empty for history entries

    return new HistoryViewTabSource({
      context: {
        id: ctx.workspaceId,
      },
      entryType,
      record,
    });
  }
}

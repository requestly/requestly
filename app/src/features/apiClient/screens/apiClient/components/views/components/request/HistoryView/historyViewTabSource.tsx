import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import PATHS from "config/constants/sub/paths";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { HistoryView } from "./HistoryView";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { RQAPI } from "features/apiClient/types";

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
    return new HistoryViewTabSource({
      context: {
        id: ctx.workspaceId,
      },
      entryType,
      record: {
        data: {
          type: entryType,
          request: { url: "", method: "GET", headers: [], queryParams: [] },
          response: null,
        } as any,
        type: RQAPI.RecordType.API,
        id: "",
        name: "",
        collectionId: "",
        ownerId: "",
        deleted: false,
        createdBy: "",
        updatedBy: "",
        createdTs: 0,
        updatedTs: 0,
      },
    });
  }
}

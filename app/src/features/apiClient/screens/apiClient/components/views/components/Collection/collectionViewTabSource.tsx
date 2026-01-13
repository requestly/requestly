import { CollectionView } from "./CollectionView";
import PATHS from "config/constants/sub/paths";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { getApiClientRecordsStore } from "features/apiClient/commands/store.utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getApiClientFeatureContext } from "features/apiClient/slices";

interface CollectionViewTabSourceMetadata extends TabSourceMetadata {}

export class CollectionViewTabSource extends BaseTabSource {
  constructor(metadata: CollectionViewTabSourceMetadata) {
    super();
    this.component = (
      // <Collection id={metadata.id} />
      <CollectionView key={metadata.id} collectionId={metadata.id} />
    );
    this.metadata = {
      ...metadata,
      name: "collection",
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdOutlineFolder />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): CollectionViewTabSource {
    const { collectionId } = matchedPath.params;
    const ctx = getApiClientFeatureContext();

    if (!collectionId) {
      throw new Error("Collection id not found!");
    }

    return new CollectionViewTabSource({ id: collectionId, title: "Collection", context: { id: ctx.workspaceId } });
  }

  getIsValidTab(context: ApiClientFeatureContext): boolean {
    const store = getApiClientRecordsStore(context);
    const isExist = store.getState().getData(this.metadata.id);
    return !!isExist;
  }
}

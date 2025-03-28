import { CollectionView } from "./CollectionView";
import PATHS from "config/constants/sub/paths";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MatchedTabSource } from "componentsV2/Tabs/types";

interface CollectionViewTabSourceMetadata {
  id: string;
  title: string;
}

export class CollectionViewTabSource extends BaseTabSource {
  constructor(metadata: CollectionViewTabSourceMetadata) {
    super();
    this.component = <CollectionView collectionId={metadata.id} />;
    this.metadata = {
      id: metadata.id,
      name: "collection",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): CollectionViewTabSource {
    const { collectionId } = matchedPath.params;

    if (!collectionId) {
      throw new Error("Collection id not found!");
    }

    return new CollectionViewTabSource({ id: collectionId, title: "Collection" });
  }
}

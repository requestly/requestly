import { CollectionView } from "./CollectionView";
import PATHS from "config/constants/sub/paths";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";
import { MatchedTabSource, TabSourceMetadata } from "componentsV2/Tabs/types";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";

interface CollectionViewTabSourceMetadata extends TabSourceMetadata {
  focusBreadcrumb?: boolean;
}

export class CollectionViewTabSource extends BaseTabSource {
  constructor(metadata: CollectionViewTabSourceMetadata) {
    super();
    this.component = <CollectionView key={metadata.id} collectionId={metadata.id} />;
    this.metadata = {
      id: metadata.id,
      name: "collection",
      title: metadata.title,
      isNewTab: metadata.focusBreadcrumb,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${encodeURI(this.metadata.id)}`;
    this.icon = <MdOutlineFolder />;
  }

  static create(matchedPath: MatchedTabSource["matchedPath"]): CollectionViewTabSource {
    const { collectionId } = matchedPath.params;

    if (!collectionId) {
      throw new Error("Collection id not found!");
    }

    return new CollectionViewTabSource({ id: collectionId, title: "Collection" });
  }
}

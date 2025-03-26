import { CollectionView } from "./CollectionView";
import PATHS from "config/constants/sub/paths";
import { BaseTabSource } from "componentsV2/Tabs/helpers/baseTabSource";

interface CollectionViewTabSourceMetadata {
  title: string;
  id: string;
}

export class CollectionViewTabSource extends BaseTabSource {
  constructor(metadata: CollectionViewTabSourceMetadata) {
    super();
    this.component = <CollectionView />;
    this.metadata = {
      id: metadata.id,
      name: "collection",
      title: metadata.title,
    };
    this.urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/${this.metadata.name}/${this.metadata.id}`;
  }
}

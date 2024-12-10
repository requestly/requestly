import React from "react";
import { RQAPI } from "features/apiClient/types";
import "./collectionOverview.scss";

interface CollectionOverviewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({ collection }) => {
  return (
    <div className="collection-overview-container">
      <div className="collection-overview-title">{collection?.name || "New Collection"}</div>
      <div className="collection-overview-description">
        {collection?.description || "No description for this collection"}
      </div>
    </div>
  );
};

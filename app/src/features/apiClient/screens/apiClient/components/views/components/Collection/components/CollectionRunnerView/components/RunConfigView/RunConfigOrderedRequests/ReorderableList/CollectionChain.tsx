import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { RQTooltip } from "lib/design-system-v2/components";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";

interface Props {
  recordId: RQAPI.ApiClientRecord["id"];
}

const CollectionChainItem: React.FC<{ collectionId: RQAPI.CollectionRecord["id"]; isLastItem: boolean }> = ({
  collectionId,
  isLastItem,
}) => {
  const collection = useApiRecord(collectionId);

  return (
    <div className="collection-path-item">
      <RQTooltip title={collection?.name || "Collection"} placement="top">
        <img
          width={16}
          height={16}
          alt="collection icon"
          className="collection-icon"
          src={"/assets/media/apiClient/folder-more-line.svg"}
        />
      </RQTooltip>
      {isLastItem ? null : <span className="separator">/</span>}
    </div>
  );
};

export const CollectionChain: React.FC<Props> = ({ recordId }) => {
  const [getParentChain, getData] = useAPIRecords((s) => [s.getParentChain, s.getData]);

  const collections = useMemo(() => {
    const parentIds = getParentChain(recordId);
    const parents = parentIds
      .map((id) => getData(id))
      .filter((record): record is RQAPI.CollectionRecord => Boolean(record))
      .reverse();

    return parents;
  }, [getData, getParentChain, recordId]);

  return collections.length > 0 ? (
    <div className="collection-path-container">
      {collections.map((c, index) => {
        return <CollectionChainItem key={c.id} collectionId={c.id} isLastItem={index === collections.length - 1} />;
      })}
    </div>
  ) : null;
};

import React from "react";
import { RQAPI } from "features/apiClient/types";
import { RQTooltip } from "lib/design-system-v2/components";

interface Props {
  collections: RQAPI.CollectionRecord[];
}

export const CollectionChain: React.FC<Props> = ({ collections }) => {
  return (
    <div className="collection-path-container">
      {collections.map((c, index) => {
        return (
          <div key={c.id} className="collection-path-item">
            <RQTooltip title={c.name}>
              <img
                width={16}
                height={16}
                alt="collection icon"
                className="collection-icon"
                src={"/assets/media/apiClient/folder-more-line.svg"}
              />
            </RQTooltip>

            {index === collections.length - 1 ? null : <span className="separator">/</span>}
          </div>
        );
      })}
    </div>
  );
};

import { HeadersTable } from "../../../../../components/request/components/HeadersTable/HeadersTable";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import React from "react";

interface Props {
  entity: BufferedGraphQLRecordEntity;
}

export const RequestHeaders: React.FC<Props> = ({ entity }) => {
  return (
    <div className="graphql-request-tab-content">
      <HeadersTable entity={entity} />
    </div>
  );
};

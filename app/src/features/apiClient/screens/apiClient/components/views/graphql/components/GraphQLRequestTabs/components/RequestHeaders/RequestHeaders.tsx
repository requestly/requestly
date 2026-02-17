import { HeadersTable } from "../../../../../components/request/components/HeadersTable/HeadersTable";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import React from "react";

interface Props {
  entity: BufferedGraphQLRecordEntity;
}

export const RequestHeaders: React.FC<Props> = ({ entity }) => {
  return <HeadersTable entity={entity} />;
};

import React, { useCallback } from "react";
import AuthorizationView from "../../../../../components/request/components/AuthorizationView";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { RQAPI } from "features/apiClient/types";

interface Props {
  entity: BufferedGraphQLRecordEntity;
}

export const GraphQLAuthView: React.FC<Props> = ({ entity }) => {
  const auth = useApiClientSelector((s) => entity.getAuth(s));
  const collectionId = useApiClientSelector((s) => entity.getCollectionId(s));

  const handleAuthChange = useCallback(
    (newAuth: RQAPI.Auth) => {
      entity.setAuth(newAuth);
    },
    [entity]
  );

  return (
    <div className="graphql-request-tab-content" style={{ height: "inherit" }}>
      <AuthorizationView
        defaults={auth}
        onAuthUpdate={handleAuthChange}
        isRootLevelRecord={!collectionId}
        recordId={entity.meta.referenceId}
      />
    </div>
  );
};

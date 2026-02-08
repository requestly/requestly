import { GraphQLEditor } from "../../GraphQLEditor";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import React, { useCallback } from "react";

interface Props {
  entity: BufferedGraphQLRecordEntity;
}

export const VariablesEditor: React.FC<Props> = ({ entity }) => {
  const variables = useApiClientSelector((s) => entity.getVariables(s) || "");

  const handleChange = useCallback(
    (value: string) => {
      entity.setVariables(value);
    },
    [entity]
  );

  return <GraphQLEditor type="variables" className="variables-editor" initialDoc={variables} onChange={handleChange} />;
};

import React, { useState } from "react";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import "./pathVariableTable.scss";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { KeyValueTable } from "features/apiClient/screens/apiClient/components/views/components/request/components/KeyValueTable/KeyValueTable";

interface PathVariableTableProps {
  entity: BufferedHttpRecordEntity;
}

export const PathVariableTable: React.FC<PathVariableTableProps> = ({ entity }) => {
  const pathVariables = useApiClientSelector((s) => entity.getPathVariables(s) || []);
  const scopedVariables = useScopedVariables(entity.meta.referenceId);
  const [showDescription, setShowDescription] = useState(false);

  if (pathVariables.length === 0) {
    return null;
  }

  return (
    <KeyValueTable
      data={pathVariables}
      variables={scopedVariables}
      onChange={entity.setPathVariables.bind(entity)}
      isEmbedded={true}
      hideIsEnabled={true}
      hideFooter={true}
      tableType="Path Variables"
      extraColumns={{
        description: {
          visible: showDescription,
          onToggle: setShowDescription,
        },
        dataType: { visible: true },
      }}
      headerContent={<div className="params-table-title path-variables-table-title">Path Variables</div>}
    />
  );
};

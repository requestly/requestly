import React, { useState, useEffect, useRef, useCallback } from "react";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import "./pathVariableTable.scss";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { KeyValueTable } from "features/apiClient/screens/apiClient/components/views/components/request/components/KeyValueTable/KeyValueTable";
import { KeyValuePair } from "features/apiClient/types";
import { useKeyValueTableSplitLayout } from "../../../components/request/components/KeyValueTable/KeyValueTableSplitLayout/KeyValueTableSplitLayout";

interface PathVariableTableProps {
  entity: BufferedHttpRecordEntity;
}

export const PathVariableTable: React.FC<PathVariableTableProps> = ({ entity }) => {
  const variables = useApiClientSelector((s) => entity.getPathVariables(s) || []);
  const scopedVariables = useScopedVariables(entity.meta.referenceId);
  const [showDescription, setShowDescription] = useState(false);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const layoutContext = useKeyValueTableSplitLayout();

  const prevLength = useRef(variables.length);
  useEffect(() => {
    if (variables.length > prevLength.current) {
      scrollTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      prevLength.current = variables.length;
    }
  }, [variables.length]);

  const handleChange = useCallback(
    (updatedVariables: KeyValuePair[]) => {
      if (entity.setPathVariables) {
        entity.setPathVariables(updatedVariables);
      } else {
        updatedVariables.forEach((v) => {
          const { key, ...rest } = v;
          entity.setPathVariable(key, rest);
        });
      }
    },
    [entity]
  );

  useEffect(() => {
    if (layoutContext?.bulkEditorState?.title === "Path Variables") {
      layoutContext.syncBulkEditor({
        data: variables,
        onChange: handleChange,
        title: "Path Variables",
      });
    }
  }, [variables, handleChange, layoutContext]);

  const handleSetShowBulkEdit = useCallback(
    (show: boolean) => {
      if (!layoutContext) return;
      if (show) {
        layoutContext.openBulkEditor({
          data: variables,
          onChange: handleChange,
          title: "Path Variables",
        });
      } else {
        layoutContext.closeBulkEditor();
      }
    },
    [layoutContext, variables, handleChange]
  );

  if (variables.length === 0) return null;

  return (
    <>
      <div className="params-table-title path-variables-table-title">Path Variables</div>
      <KeyValueTable
        data={variables}
        variables={scopedVariables}
        onChange={handleChange}
        tableType="Path Variables"
        extraColumns={{
          description: {
            visible: showDescription,
            onToggle: setShowDescription,
          },
          dataType: { visible: true },
        }}
        setShowBulkEditPanel={handleSetShowBulkEdit}
        hideIsEnabled={true}
      />
      <div ref={scrollTargetRef} />
    </>
  );
};

import React, { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { PathVariableTableEditableRow, PathVariableTableEditableCell } from "./PathVariableTableRow";
import { RQAPI } from "features/apiClient/types";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import "./pathVariableTable.scss";

interface PathVariableTableProps {
  recordId: string;
  onChange: (variables: RQAPI.PathVariable[]) => void;
}

type ColumnTypes = Exclude<TableProps<RQAPI.PathVariable>["columns"], undefined>;

export const PathVariableTable: React.FC<PathVariableTableProps> = ({ recordId, onChange }) => {
  const [variables, setPathVariables] = usePathVariablesStore((state) => [state.pathVariables, state.setPathVariables]);
  const scopedVariables = useScopedVariables(recordId);

  const handleUpdateVariable = useCallback(
    (variable: RQAPI.PathVariable) => {
      const updatedVariables = variables.map((item) => (item.id === variable.id ? { ...item, ...variable } : item));
      setPathVariables(updatedVariables);
      onChange(updatedVariables);
    },
    [variables, setPathVariables, onChange]
  );

  const columns = useMemo(() => {
    return [
      {
        title: "key",
        dataIndex: "key",
        width: "25%",
        editable: false,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: false,
          dataIndex: "key",
          title: "key",
          environmentVariables: scopedVariables,
          handleUpdateVariable,
        }),
      },
      {
        title: "value",
        dataIndex: "value",
        width: "35%",
        editable: true,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          environmentVariables: scopedVariables,
          handleUpdateVariable,
        }),
      },
      {
        title: "description",
        dataIndex: "description",
        width: "40%",
        editable: true,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: true,
          dataIndex: "description",
          title: "description",
          environmentVariables: scopedVariables,
          handleUpdateVariable,
        }),
      },
    ];
  }, [handleUpdateVariable, scopedVariables]);

  if (variables.length === 0) {
    return null;
  }

  return (
    <>
      <div className="params-table-title path-variables-table-title">Path Variables</div>
      <ContentListTable
        id="api-path-variable-table"
        className="api-path-variable-table"
        bordered
        showHeader={false}
        rowKey="id"
        columns={columns as ColumnTypes}
        data={variables}
        locale={{ emptyText: `No path variables found` }}
        components={{
          body: {
            row: PathVariableTableEditableRow,
            cell: PathVariableTableEditableCell,
          },
        }}
        scroll={{ x: true }}
      />
    </>
  );
};

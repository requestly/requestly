import React, { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { EditableRow, EditableCell } from "./PathVariableTableRow";
import { RQAPI } from "features/apiClient/types";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import "./pathVariableTable.scss";

interface PathVariableTableProps {
  onChange: (variables: RQAPI.PathVariable[]) => void;
}

type ColumnTypes = Exclude<TableProps<RQAPI.PathVariable>["columns"], undefined>;

export const PathVariableTable: React.FC<PathVariableTableProps> = ({ onChange }) => {
  const [variables, setPathVariables] = usePathVariablesStore((state) => [state.pathVariables, state.setPathVariables]);

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
        width: "15%",
        editable: false,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: false,
          dataIndex: "key",
          title: "key",
          variables,
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
          variables,
          handleUpdateVariable,
        }),
      },
      {
        title: "description",
        dataIndex: "description",
        width: "50%",
        editable: true,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: true,
          dataIndex: "description",
          title: "description",
          variables,
          handleUpdateVariable,
        }),
      },
    ];
  }, [variables, handleUpdateVariable]);

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
            row: EditableRow,
            cell: EditableCell,
          },
        }}
        scroll={{ x: true }}
      />
    </>
  );
};

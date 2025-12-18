import React, { useCallback, useMemo, useState } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { PathVariableTableEditableRow, PathVariableTableEditableCell } from "./PathVariableTableRow";
import { KeyValueDataType, RQAPI } from "features/apiClient/types";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import "./pathVariableTable.scss";
import { doesValueMatchDataType } from "features/apiClient/screens/apiClient/utils";
import { KeyValueTableSettingsDropdown } from "../../../components/request/components/KeyValueTable/KeyValueTableSettingsDropdown";
import { capitalize } from "lodash";

interface PathVariableTableProps {
  recordId: string;
  onChange: (variables: RQAPI.PathVariable[]) => void;
}

type ColumnTypes = Exclude<TableProps<RQAPI.PathVariable>["columns"], undefined>;

export const PathVariableTable: React.FC<PathVariableTableProps> = ({ recordId, onChange }) => {
  const [variables, setPathVariables] = usePathVariablesStore((state) => [state.pathVariables, state.setPathVariables]);
  const scopedVariables = useScopedVariables(recordId);
  const [showDescription, setShowDescription] = useState(false);

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
        title: "Key",
        dataIndex: "key",
        width: "30%",
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
        title: "Value",
        dataIndex: "value",
        width: "30%",
        editable: true,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          environmentVariables: scopedVariables,
          handleUpdateVariable,
          error: doesValueMatchDataType(record.value, record.dataType ?? KeyValueDataType.STRING)
            ? null
            : `Value must be ${capitalize(record.dataType ?? KeyValueDataType.STRING)}`,
        }),
      },
      {
        title: (
          <div className="path-variable-table-settings">
            <span>Type</span>
            {!showDescription && (
              <KeyValueTableSettingsDropdown
                showDescription={showDescription}
                onToggleDescription={(show: any) => {
                  setShowDescription(show);
                }}
              />
            )}
          </div>
        ),
        dataIndex: "dataType",
        width: 120,
        className: "path-variable-type-column",
        editable: true,
        onCell: (record: RQAPI.PathVariable) => ({
          record,
          editable: true,
          dataIndex: "dataType",
          title: "type",
          environmentVariables: scopedVariables,
          handleUpdateVariable,
        }),
      },
      showDescription && {
        title: (
          <div className="path-variable-table-settings">
            <span>Description</span>
            <KeyValueTableSettingsDropdown
              showDescription={showDescription}
              onToggleDescription={(show: any) => {
                setShowDescription(show);
              }}
            />
          </div>
        ),
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
    ].filter(Boolean);
  }, [handleUpdateVariable, scopedVariables, showDescription]);

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
        showHeader={true}
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

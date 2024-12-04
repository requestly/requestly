import { TableProps, Tooltip } from "antd";
import { EnvironmentVariableTableRow } from "../VariablesList";
import { RQButton } from "lib/design-system-v2/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";
import { useCallback } from "react";
import { EnvironmentVariableType } from "backend/environment/types";

interface Props {
  handleSaveVariable: (record: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => void;
  handleDeleteVariable: (key: string) => void;
  visibleSecretsRowIds: number[];
  updateVisibleSecretsRowIds: (id: number) => void;
  recordsCount: number;
}

type ColumnTypes = Exclude<TableProps<EnvironmentVariableTableRow>["columns"], undefined>;

export const useVariablesListColumns = ({
  handleSaveVariable,
  handleDeleteVariable,
  visibleSecretsRowIds,
  updateVisibleSecretsRowIds,
  recordsCount,
}: Props) => {
  const checkIsSecretHidden = useCallback(
    (recordId: number) => {
      return !visibleSecretsRowIds.includes(recordId);
    },
    [visibleSecretsRowIds]
  );

  const columns: (ColumnTypes[number] & { editable: boolean })[] = [
    {
      title: "Key",
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "key",
        title: "Key",
        handleSaveVariable,
      }),
    },
    {
      title: "Type",
      editable: true,
      width: "150px",
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "type",
        title: "Type",
        handleSaveVariable,
        options: ["string", "number", "boolean", "secret"],
      }),
    },
    {
      title: (
        <div className="variable-value-column-title">
          Initial Value{" "}
          <Tooltip
            color="#000"
            title="Initial values will be synced across the workspace. These values will be used by default if no user-defined Current value is set for the variable."
          >
            <span className="synced-tag">SYNCED</span>
          </Tooltip>
        </div>
      ),
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "syncValue",
        title: "Sync Value",
        handleSaveVariable,
        isSecret: checkIsSecretHidden(record.id),
      }),
    },
    {
      title: (
        <div className="variable-value-column-title">
          Current Value{" "}
          <Tooltip
            color="#000"
            title="Current values are user-defined entries that are not synced across the workspace. These values will override the defined Initial values."
          >
            <span className="local-tag">LOCAL</span>
          </Tooltip>
        </div>
      ),
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "localValue",
        title: "Local Value",
        handleSaveVariable,
        isSecret: checkIsSecretHidden(record.id),
      }),
    },
    {
      title: "",
      editable: false,
      width: "100px",
      render: (_: any, record: EnvironmentVariableTableRow) => {
        return (
          <div className="variable-row-actions">
            {record.type === EnvironmentVariableType.Secret && (
              <RQButton
                icon={checkIsSecretHidden(record.id) ? <RiEyeOffLine /> : <RiEyeLine />}
                type="transparent"
                size="small"
                onClick={() => updateVisibleSecretsRowIds(record.id)}
                className="secret-variable-toggle-btn"
              />
            )}
            {(recordsCount > 1 ||
              (recordsCount === 1 && (record.key !== "" || record.syncValue !== "" || record.localValue !== ""))) && (
              <RQButton
                icon={<RiDeleteBin6Line />}
                type="transparent"
                size="small"
                className="delete-variable-btn"
                onClick={() => handleDeleteVariable(record.key)}
              />
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};

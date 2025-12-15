import { Switch, TableProps, Tooltip } from "antd";
import { VariableRow } from "../VariablesList";
import { RQButton } from "lib/design-system-v2/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";
import { useCallback } from "react";
import { EnvironmentVariableType } from "backend/environment/types";
import { RoleBasedComponent } from "features/rbac";
import InfoIcon from "components/misc/InfoIcon";

interface Props {
  handleVariableChange: (record: VariableRow, fieldChanged: keyof VariableRow) => void;
  handleDeleteVariable: (key: number) => void;
  handleUpdatePersisted: (id: number, isPersisted: boolean) => void;
  visibleSecretsRowIds: number[];
  updateVisibleSecretsRowIds: (id: number) => void;
  recordsCount: number;
  duplicateKeyIndices?: Set<number>;
  isReadOnly: boolean;
  container: "environments" | "runtime";
}

type ColumnTypes = Exclude<TableProps<VariableRow>["columns"], undefined>;

export const useVariablesListColumns = ({
  handleVariableChange,
  handleDeleteVariable,
  handleUpdatePersisted,
  visibleSecretsRowIds,
  updateVisibleSecretsRowIds,
  recordsCount,
  duplicateKeyIndices,
  isReadOnly,
  container,
}: Props) => {
  const checkIsSecretHidden = useCallback(
    (recordId: number) => {
      return !visibleSecretsRowIds.includes(recordId);
    },
    [visibleSecretsRowIds]
  );

  type VariableColumn = ColumnTypes[number] & { editable: boolean };
  const allColumns: (VariableColumn | null)[] = [
    {
      title: "Key",
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "key",
        title: "Key",
        handleVariableChange,
        duplicateKeyIndices,
        isReadOnly,
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
        handleVariableChange,
        isReadOnly,
        options: ["string", "number", "boolean", "secret"],
      }),
    },
    container === "environments"
      ? {
          title: () => {
            return (
              <div className="variable-value-column-title">
                Initial Value{" "}
                <Tooltip
                  color="#000"
                  title="Initial values will be synced across the workspace. These values will be used by default if no user-defined Current value is set for the variable."
                >
                  <span className="synced-tag">SYNCED</span>
                </Tooltip>
              </div>
            );
          },
          editable: true,
          onCell: (record) => ({
            record,
            editable: true,
            dataIndex: "syncValue",
            title: "Sync Value", // feels useless
            handleVariableChange,
            isReadOnly,
            isSecret: checkIsSecretHidden(record.id),
          }),
        }
      : null,
    {
      title:
        container === "environments" ? (
          <div className="variable-value-column-title">
            Current Value{" "}
            <Tooltip
              color="#000"
              title="Current values are user-defined entries that are not synced across the workspace. These values will override the defined Initial values."
            >
              <span className="local-tag">LOCAL</span>
            </Tooltip>
          </div>
        ) : (
          <div className="variable-value-column-title">Current Value</div>
        ),
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "localValue",
        title: "Local Value",
        handleVariableChange,
        isReadOnly: isReadOnly && recordsCount === 1 && !record.key,
        isSecret: checkIsSecretHidden(record.id),
      }),
    },
    container === "runtime"
      ? {
          title: (
            <div className="variable-value-column-title">
              Persistent{" "}
              <InfoIcon
                text={
                  <>
                    Persisted runtime values retain their data across sessions and remain accessible until manually
                    cleared by the user
                    <a href="https://www.requestly.com" target="_blank" rel="noreferrer">
                      Learn more
                    </a>
                  </>
                }
                showArrow={false}
                tooltipPlacement="right"
                style={{
                  width: "14px",
                  height: "14px",
                  color: "var(--requestly-color-text-subtle)",
                }}
              />
            </div>
          ),
          editable: true,
          render: (_, record) => {
            return (
              <span className="variable-value-column-persist-section">
                <Switch
                  size="small"
                  className="variable-value-column-switch"
                  disabled={!record.key && !record.syncValue}
                  checked={container === "runtime" && record.isPersisted}
                  onChange={(checked) => handleUpdatePersisted(record.id, checked)}
                />
                <span
                  style={{
                    position: "relative",
                    bottom: "2px",
                  }}
                >
                  {container === "runtime" && record.isPersisted ? "Yes" : "No"}
                </span>
              </span>
            );
          },
        }
      : null,
    {
      title: "",
      editable: false,
      width: "100px",
      render: (_: any, record: VariableRow) => {
        return (
          <RoleBasedComponent resource="api_client_environment" permission="delete">
            <div className="variable-row-actions">
              {record.type === EnvironmentVariableType.Secret ? (
                <RQButton
                  icon={checkIsSecretHidden(record.id) ? <RiEyeOffLine /> : <RiEyeLine />}
                  type="transparent"
                  size="small"
                  onClick={() => updateVisibleSecretsRowIds(record.id)}
                  className="secret-variable-toggle-btn"
                />
              ) : null}

              {(recordsCount > 1 ||
                (recordsCount === 1 &&
                  (record.key !== "" ||
                    record.syncValue !== "" ||
                    (container === "environments" && record.localValue !== "")))) && (
                <RQButton
                  icon={<RiDeleteBin6Line />}
                  type="transparent"
                  size="small"
                  className="delete-variable-btn"
                  onClick={() => handleDeleteVariable(record.id)}
                />
              )}
            </div>
          </RoleBasedComponent>
        );
      },
    },
  ];
  const columns: VariableColumn[] = allColumns.filter((c): c is VariableColumn => Boolean(c));
  return columns;
};

import React, { useState, useCallback, useMemo } from "react";
import { Table, Tag, Button, Dropdown, Tooltip, Checkbox, Popover, Input } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "store/types";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { BsThreeDots } from "@react-icons/all-files/bs/BsThreeDots";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import {
  AwsSecretValue,
  AwsSecretReference,
  SecretProviderType,
  SecretReference,
} from "@requestly/shared/types/entities/secretsManager";
import {
  selectSecretsForSelectedProvider,
  selectSelectedProviderId,
  selectPendingEntriesForSelectedProvider,
  selectAllAliasesForProvider,
  secretsManagerActions,
  getSecretId,
} from "features/apiClient/slices/secrets-manager";
import { parseSecretKeyValues } from "../../utils/parseSecretKeyValues";
import "./secretsTable.scss";
import { deleteSecret } from "features/apiClient/slices/secrets-manager/thunks";

const DRAFT_KEY_PREFIX = "__draft__";

type AwsTableRow = AwsSecretValue & { key: string; rowType: "fetched" };
type DraftTableRow = {
  key: string;
  draftIndex: number;
  secretReference: AwsSecretReference;
  rowType: "draft";
};
type TableRow = AwsTableRow | DraftTableRow;

function isDraftRow(row: TableRow): row is DraftTableRow {
  return row.rowType === "draft";
}

const ColHeader: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <span className="col-header">
    {label}
    <Tooltip title={tooltip}>
      <AiOutlineInfoCircle className="col-info-icon" />
    </Tooltip>
  </span>
);

const ToggleColumnPopover: React.FC<{ onToggle: () => void; isVisible: boolean }> = ({ onToggle, isVisible }) => (
  <div className="toggle-column-popover" onClick={onToggle}>
    <p className="show-columns-text">Show columns</p>
    <div className="version-id-checkbox">
      <Checkbox checked={isVisible} className="checkbox" />
      <span className="col-name">Version ID</span>
      <Tooltip title="The version ID of the secret value">
        <AiOutlineInfoCircle className="col-info-icon" />
      </Tooltip>
    </div>
  </div>
);

interface SecretsTableProps {
  onViewKeyValues?: (secretId: string) => void;
}

const SecretsTable: React.FC<SecretsTableProps> = ({ onViewKeyValues }) => {
  const dispatch = useDispatch<AppDispatch>();
  const secrets = useSelector(selectSecretsForSelectedProvider) as AwsSecretValue[];
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const pendingEntries = useSelector(selectPendingEntriesForSelectedProvider);

  const [showVersionId, setShowVersionId] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const existingAliases = useSelector((state: any) =>
    selectedProviderId ? selectAllAliasesForProvider(state, selectedProviderId) : []
  );

  const toggleVisibility = useCallback((id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddClick = () => {
    if (!selectedProviderId) return;
    dispatch(
      secretsManagerActions.addPendingEntry({ providerId: selectedProviderId, entry: { alias: "", identifier: "" } })
    );
  };

  const handleRowChange = (row: TableRow, field: "alias" | "identifier" | "version", value: string) => {
    if (!selectedProviderId) {
      return;
    }

    if (field === "alias" && value) {
      const currentAlias = row.secretReference.alias;
      const otherAliases = existingAliases.filter((a) => a !== currentAlias);
      if (otherAliases.includes(value)) {
        return;
      }
    }

    if (isDraftRow(row)) {
      dispatch(
        secretsManagerActions.updatePendingEntry({
          providerId: selectedProviderId,
          index: row.draftIndex,
          entry: { [field]: value },
        })
      );
      return;
    }

    const secretId = getSecretId(row.secretReference);

    if (field === "alias") {
      dispatch(
        secretsManagerActions.unsafePatchSecret({
          id: secretId,
          patcher: (secret) => {
            secret.secretReference.alias = value;
          },
        })
      );
    } else {
      dispatch(secretsManagerActions.removeSecret(secretId));
      dispatch(
        secretsManagerActions.addPendingEntry({
          providerId: selectedProviderId,
          entry: {
            alias: row.secretReference.alias,
            identifier: field === "identifier" ? value : row.secretReference.identifier,
            version: field === "version" ? value : row.secretReference.version,
          },
        })
      );
    }
  };

  const handleDeleteDraft = (index: number) => {
    if (!selectedProviderId) return;
    dispatch(secretsManagerActions.removePendingEntry({ providerId: selectedProviderId, index }));
  };

  const handleDeleteSecret = (secretReference: SecretReference) => {
    if (!selectedProviderId) return;
    dispatch(deleteSecret({ providerId: selectedProviderId, secretReference }));
  };

  const dataSource: TableRow[] = useMemo(() => {
    const rows: TableRow[] = secrets.map((s) => ({
      ...s,
      key: getSecretId(s.secretReference),
      rowType: "fetched" as const,
    }));
    pendingEntries.forEach((entry, index) => {
      rows.push({
        key: `${DRAFT_KEY_PREFIX}${index}`,
        draftIndex: index,
        secretReference: {
          type: SecretProviderType.AWS_SECRETS_MANAGER,
          alias: entry.alias,
          identifier: entry.identifier,
          version: entry.version,
        },
        rowType: "draft",
      });
    });
    return rows;
  }, [secrets, pendingEntries]);

  const columns: ColumnsType<TableRow> = [
    {
      title: <ColHeader label="Alias" tooltip="Key to reference this secret in requests via {{secret:ALIAS}}" />,
      key: "alias",
      width: "18%",
      render: (_, row) => {
        return (
          <Input
            className="draft-cell-input"
            value={row.secretReference.alias}
            placeholder="Enter alias"
            size="small"
            onChange={(e) => handleRowChange(row, "alias", e.target.value)}
          />
        );
      },
    },
    {
      title: <ColHeader label="ARN/Secret name" tooltip="AWS Secret Manager identifier (ARN or name)" />,
      key: "ARN",
      render: (_, row) => {
        return (
          <Input
            className="draft-cell-input"
            value={row.secretReference.identifier}
            placeholder="Enter ARN/Secret name"
            size="small"
            onChange={(e) => handleRowChange(row, "identifier", e.target.value)}
          />
        );
      },
    },
    ...(showVersionId
      ? [
          {
            title: <ColHeader label="Version ID" tooltip="The version ID of the secret value" />,
            key: "versionId",
            width: "22%",
            render: (_: any, row: TableRow) => {
              return (
                <Input
                  className="draft-cell-input"
                  value={row.secretReference.version ?? ""}
                  placeholder="Version ID (optional)"
                  size="small"
                  onChange={(e) => handleRowChange(row, "version", e.target.value)}
                />
              );
            },
          },
        ]
      : []),
    {
      title: <ColHeader label="Secret" tooltip="Fetched secrets (plain text or key/value)" />,
      key: "value",
      render: (_: any, row: TableRow) => {
        if (isDraftRow(row)) {
          return null;
        }
        const id = row.key;
        const keyValues = parseSecretKeyValues(row.value);

        if (keyValues && keyValues.length > 0) {
          return (
            <div className="secret-tags" onClick={() => onViewKeyValues?.(id)} style={{ cursor: "pointer" }}>
              {keyValues.map((kv) => (
                <Tag key={kv.key} className="secret-tag">
                  {kv.key}
                </Tag>
              ))}
            </div>
          );
        }

        const isVisible = visibleIds.has(id);
        return (
          <div className="secret-value-row">
            <span className="secret-dots">{isVisible ? row.value ?? "" : "••••••••••••"}</span>
            <Button
              type="text"
              size="small"
              className="visibility-btn"
              icon={isVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              onClick={() => toggleVisibility(id)}
            />
          </div>
        );
      },
    },
    {
      title: (
        <Popover
          trigger="click"
          placement="bottomLeft"
          overlayClassName="show-columns-popover"
          destroyTooltipOnHide
          content={<ToggleColumnPopover onToggle={() => setShowVersionId((v) => !v)} isVisible={showVersionId} />}
        >
          <Button type="text" size="small" className="show-columns-btn" icon={<BsThreeDots />} />
        </Popover>
      ),
      key: "actions",
      width: "5%",
      align: "right" as const,
      render: (_: any, row: TableRow) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "delete",
                  icon: <RiDeleteBin6Line />,
                  label: "Remove",
                  danger: true,
                  onClick: () => {
                    if (isDraftRow(row)) {
                      handleDeleteDraft(row.draftIndex);
                    } else {
                      handleDeleteSecret(row.secretReference);
                    }
                  },
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" size="small" className="row-menu-btn" icon={<BsThreeDots />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table<TableRow>
      className="secrets-antd-table"
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size="small"
      bordered
      tableLayout="fixed"
      rowClassName={(row) => {
        if (isDraftRow(row)) return "draft-row";
        return "";
      }}
      footer={() => (
        <Button type="text" icon={<FiPlus />} className="add-secret-btn" onClick={handleAddClick}>
          Add
        </Button>
      )}
    />
  );
};

export default SecretsTable;

import React, { useState, useCallback, useMemo } from "react";
import { Table, Tag, Button, Dropdown, Tooltip, Checkbox, Popover, Input } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { BsThreeDots } from "@react-icons/all-files/bs/BsThreeDots";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
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

const DRAFT_KEY_PREFIX = "__draft__";

type AwsTableRow = AwsSecretValue & { key: string; rowType: "fetched" };
type DraftTableRow = {
  key: string;
  draftIndex: number;
  alias: string;
  identifier: string;
  version?: string;
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
  const dispatch = useDispatch();
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

  const handleDraftChange = (index: number, field: "alias" | "identifier" | "version", value: string) => {
    if (!selectedProviderId) return;

    if (field === "alias" && value) {
      const otherAliases = existingAliases.filter((_, i) => {
        const secretCount = secrets.length;
        return i < secretCount || i !== secretCount + index;
      });
      if (otherAliases.includes(value)) {
        return;
      }
    }

    dispatch(
      secretsManagerActions.updatePendingEntry({
        providerId: selectedProviderId,
        index,
        entry: { [field]: value },
      })
    );
  };

  const handleDeleteDraft = (index: number) => {
    if (!selectedProviderId) return;
    dispatch(secretsManagerActions.removePendingEntry({ providerId: selectedProviderId, index }));
  };

  const handleDeleteSecret = (id: string) => {
    dispatch(secretsManagerActions.removeSecret(id));
  };

  const dataSource: TableRow[] = useMemo(() => {
    const rows: TableRow[] = secrets.map((s) => ({ ...s, key: getSecretId(s), rowType: "fetched" as const }));
    pendingEntries.forEach((entry, index) => {
      rows.push({
        key: `${DRAFT_KEY_PREFIX}${index}`,
        draftIndex: index,
        alias: entry.alias,
        identifier: entry.identifier,
        version: entry.version,
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
        if (isDraftRow(row)) {
          return (
            <Input
              className="draft-cell-input"
              value={row.alias}
              placeholder="Enter alias"
              size="small"
              onChange={(e) => handleDraftChange(row.draftIndex, "alias", e.target.value)}
            />
          );
        }
        const alias = row.secretReference.alias;
        return (
          <Tooltip title={alias}>
            <span className="cell-text truncate">{alias ?? ""}</span>
          </Tooltip>
        );
      },
    },
    {
      title: <ColHeader label="ARN/Secret name" tooltip="AWS Secret Manager identifier (ARN or name)" />,
      key: "ARN",
      render: (_, row) => {
        if (isDraftRow(row)) {
          return (
            <Input
              className="draft-cell-input"
              value={row.identifier}
              placeholder="Enter ARN/Secret name"
              size="small"
              onChange={(e) => handleDraftChange(row.draftIndex, "identifier", e.target.value)}
            />
          );
        }
        const identifier = row.secretReference.identifier;
        return (
          <Tooltip title={identifier}>
            <span className="cell-text truncate">{identifier ?? ""}</span>
          </Tooltip>
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
              if (isDraftRow(row)) {
                return (
                  <Input
                    className="draft-cell-input"
                    value={row.version ?? ""}
                    placeholder="Version ID (optional)"
                    size="small"
                    onChange={(e) => handleDraftChange(row.draftIndex, "version", e.target.value)}
                  />
                );
              }
              const versionId = row.versionId;
              return (
                <Tooltip title={versionId}>
                  <span className="cell-text truncate">{versionId ?? ""}</span>
                </Tooltip>
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
        if (isDraftRow(row)) {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "delete",
                    icon: <RiDeleteBin6Line />,
                    label: "Remove",
                    danger: true,
                    onClick: () => handleDeleteDraft(row.draftIndex),
                  },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" size="small" className="row-menu-btn" icon={<BsThreeDots />} />
            </Dropdown>
          );
        }
        const id = row.key;
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "delete",
                  icon: <RiDeleteBin6Line />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDeleteSecret(id),
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

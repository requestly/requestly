import React, { useState, useRef, useCallback, useMemo } from "react";
import { Table, Tag, Button, Dropdown, Tooltip, Checkbox, Popover, Input } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { BsThreeDots } from "@react-icons/all-files/bs/BsThreeDots";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { AwsSecretValue, SecretProviderType } from "@requestly/shared/types/entities/secretsManager";
import {
  selectSecretsForSelectedProvider,
  selectSelectedProviderId,
  secretsManagerActions,
  getSecretId,
} from "features/apiClient/slices/secrets-manager";
import { secretsManagerService } from "services/secretsManagerService";
import { parseSecretKeyValues } from "../../utils/parseSecretKeyValues";
import "./secretsTable.scss";

const DRAFT_KEY = "__draft__";

type EditDraft = { identifier: string; version: string };

type AwsTableRow = AwsSecretValue & { key: string };
type DraftTableRow = { key: typeof DRAFT_KEY; isDraft: true };
type TableRow = AwsTableRow | DraftTableRow;

function isDraftRow(row: TableRow): row is DraftTableRow {
  return row.key === DRAFT_KEY;
}

const EditableCell: React.FC<{
  inputRef?: React.Ref<any>;
  value: string | undefined;
  placeholder: string;
  field: keyof EditDraft;
  onChange: (field: keyof EditDraft, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = ({ inputRef, value, placeholder, field, onChange, onKeyDown }) => (
  <Input
    ref={inputRef}
    className="draft-cell-input"
    value={value}
    placeholder={placeholder}
    size="small"
    onChange={(e) => onChange(field, e.target.value)}
    onKeyDown={onKeyDown}
  />
);

const makeInlineMenu = (onSave: () => void, onCancel: () => void) => ({
  items: [
    { key: "save", icon: <MdOutlineEdit />, label: "Save", onClick: onSave },
    { key: "cancel", icon: <RiDeleteBin6Line />, label: "Cancel", danger: true, onClick: onCancel },
  ],
});

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

  const [showVersionId, setShowVersionId] = useState(true);
  const [draftRow, setDraftRow] = useState<EditDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const addIdentifierRef = useRef<any>(null);
  const editIdentifierRef = useRef<any>(null);

  const toggleVisibility = useCallback((id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setEditDraft(null);
    setDraftRow({ identifier: "", version: "" });
    setTimeout(() => addIdentifierRef.current?.focus(), 50);
  };

  const handleSaveDraft = async () => {
    if (!draftRow || !selectedProviderId) return;

    const ref = {
      type: SecretProviderType.AWS_SECRETS_MANAGER as const,
      identifier: draftRow.identifier,
      version: draftRow.version || undefined,
    };

    const result = await secretsManagerService.getSecretValue(selectedProviderId, ref);
    if (result.type === "success" && result.data) {
      dispatch(secretsManagerActions.upsertSecrets([result.data]));
    }
    setDraftRow(null);
  };

  const handleCancelDraft = () => setDraftRow(null);

  const handleDraftChange = (field: keyof EditDraft, value: string) =>
    setDraftRow((prev) => prev && { ...prev, [field]: value });

  const handleDraftKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveDraft();
    if (e.key === "Escape") handleCancelDraft();
  };

  const handleStartEdit = (record: AwsSecretValue) => {
    setDraftRow(null);
    const id = getSecretId(record);
    setEditingId(id);
    setEditDraft({
      identifier: record.secretReference.identifier,
      version: record.secretReference.version ?? "",
    });
    setTimeout(() => editIdentifierRef.current?.focus(), 50);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editDraft || !selectedProviderId) return;

    dispatch(secretsManagerActions.removeSecret(editingId));

    const ref = {
      type: SecretProviderType.AWS_SECRETS_MANAGER as const,
      identifier: editDraft.identifier,
      version: editDraft.version || undefined,
    };

    const result = await secretsManagerService.getSecretValue(selectedProviderId, ref);
    if (result.type === "success" && result.data) {
      dispatch(secretsManagerActions.upsertSecrets([result.data]));
    }

    setEditingId(null);
    setEditDraft(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const handleEditChange = (field: keyof EditDraft, value: string) =>
    setEditDraft((prev) => prev && { ...prev, [field]: value });

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") handleCancelEdit();
  };

  const handleDeleteSecret = (id: string) => {
    dispatch(secretsManagerActions.removeSecret(id));
  };

  const dataSource: TableRow[] = useMemo(() => {
    const rows: TableRow[] = secrets.map((s) => ({ ...s, key: getSecretId(s) }));
    if (draftRow) {
      rows.push({ key: DRAFT_KEY, isDraft: true });
    }
    return rows;
  }, [secrets, draftRow]);

  const renderEditableCell = (text: string | undefined, row: TableRow, field: keyof EditDraft, placeholder: string) => {
    if (isDraftRow(row)) {
      return (
        <EditableCell
          inputRef={field === "identifier" ? addIdentifierRef : undefined}
          value={draftRow?.[field]}
          placeholder={placeholder}
          field={field}
          onChange={handleDraftChange}
          onKeyDown={handleDraftKeyDown}
        />
      );
    }
    const rowId = row.key;
    if (rowId === editingId) {
      return (
        <EditableCell
          inputRef={field === "identifier" ? editIdentifierRef : undefined}
          value={editDraft?.[field]}
          placeholder={placeholder}
          field={field}
          onChange={handleEditChange}
          onKeyDown={handleEditKeyDown}
        />
      );
    }
    return (
      <Tooltip title={text}>
        <span className="cell-text truncate">{text ?? ""}</span>
      </Tooltip>
    );
  };

  const columns: ColumnsType<TableRow> = [
    {
      title: <ColHeader label="Name" tooltip="Name to reference this secret in requests" />,
      key: "name",
      width: "18%",
      render: (_, row) => {
        if (isDraftRow(row)) return renderEditableCell(undefined, row, "identifier", "Enter identifier");
        return renderEditableCell(row.name ?? undefined, row, "identifier", "Enter identifier");
      },
    },
    {
      title: <ColHeader label="ARN/Secret name" tooltip="AWS Secret Manager identifier (ARN or name)" />,
      key: "ARN",
      render: (_, row) => {
        if (isDraftRow(row)) return renderEditableCell(undefined, row, "identifier", "Enter ARN/Secret name");
        return (
          <Tooltip title={row.ARN}>
            <span className="cell-text truncate">{row.ARN ?? ""}</span>
          </Tooltip>
        );
      },
    },
    ...(showVersionId
      ? ([
          {
            title: <ColHeader label="Version ID" tooltip="The version ID of the secret value" />,
            key: "versionId",
            width: "22%",
            render: (_: any, row: TableRow) => {
              if (isDraftRow(row)) return renderEditableCell(undefined, row, "version", "Version ID (optional)");
              return renderEditableCell(row.versionId ?? undefined, row, "version", "Version ID (optional)");
            },
          },
        ] as ColumnsType<TableRow>)
      : []),
    {
      title: <ColHeader label="Secret" tooltip="Fetched secrets (plain text or key/value)" />,
      key: "value",
      render: (_: any, row: TableRow) => {
        if (isDraftRow(row)) return null;
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
              menu={makeInlineMenu(handleSaveDraft, handleCancelDraft)}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" size="small" className="row-menu-btn" icon={<BsThreeDots />} />
            </Dropdown>
          );
        }
        const id = row.key;
        const isEditing = id === editingId;
        const menu = isEditing
          ? makeInlineMenu(handleSaveEdit, handleCancelEdit)
          : {
              items: [
                { key: "edit", icon: <MdOutlineEdit />, label: "Edit", onClick: () => handleStartEdit(row) },
                {
                  key: "delete",
                  icon: <RiDeleteBin6Line />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDeleteSecret(id),
                },
              ],
            };
        return (
          <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              className={`row-menu-btn${isEditing ? " editing" : ""}`}
              icon={<BsThreeDots />}
            />
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
        if (row.key === editingId) return "editing-row";
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

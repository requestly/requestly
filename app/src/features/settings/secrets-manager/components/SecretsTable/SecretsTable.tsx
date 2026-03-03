import React, { useState, useRef } from "react";
import { Table, Tag, Button, Dropdown, Tooltip, Checkbox, Popover, Input } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { BsThreeDots } from "@react-icons/all-files/bs/BsThreeDots";
import { FiPlus } from "@react-icons/all-files/fi/FiPlus";
import { Secret, SecretsTableProps } from "../../ProviderDetails/types";
import "./secretsTable.scss";

const DRAFT_ID = "__draft__";

type EditDraft = { alias: string; arnSecretName: string; versionId: string };
/** Inline input that sits flush inside a table cell */
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

/** Build a save/cancel dropdown menu */
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

const SecretsTable: React.FC<SecretsTableProps> = ({
  secrets,
  onToggleVisibility,
  onEditSecret,
  onDeleteSecret,
  onAddSecret,
  onViewKeyValues,
}) => {
  const [showVersionId, setShowVersionId] = useState(true);
  const [draftRow, setDraftRow] = useState<EditDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const addAliasRef = useRef<any>(null);
  const editAliasRef = useRef<any>(null);

  const handleAddClick = () => {
    setEditingId(null);
    setEditDraft(null);
    setDraftRow({ alias: "", arnSecretName: "", versionId: "" });
    setTimeout(() => addAliasRef.current?.focus(), 50);
  };
  const handleSaveDraft = () => {
    if (draftRow) {
      onAddSecret(draftRow);
      setDraftRow(null);
    }
  };
  const handleCancelDraft = () => setDraftRow(null);
  const handleDraftChange = (field: keyof EditDraft, value: string) =>
    setDraftRow((prev) => prev && { ...prev, [field]: value });
  const handleDraftKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveDraft();
    if (e.key === "Escape") handleCancelDraft();
  };

  // ── Edit (existing row) actions ──
  const handleStartEdit = (record: Secret) => {
    setDraftRow(null);
    setEditingId(record.id);
    setEditDraft({ alias: record.alias, arnSecretName: record.arnSecretName, versionId: record.versionId });
    setTimeout(() => editAliasRef.current?.focus(), 50);
  };
  const handleSaveEdit = () => {
    if (editingId && editDraft) {
      onEditSecret(editingId, editDraft);
      setEditingId(null);
      setEditDraft(null);
    }
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

  const renderEditableCell = (
    text: string,
    record: Secret,
    field: keyof EditDraft,
    placeholder: string,
    inputRef?: React.Ref<any>
  ) => {
    if (record.id === DRAFT_ID) {
      return (
        <EditableCell
          inputRef={field === "alias" ? addAliasRef : undefined}
          value={draftRow?.[field]}
          placeholder={placeholder}
          field={field}
          onChange={handleDraftChange}
          onKeyDown={handleDraftKeyDown}
        />
      );
    }
    if (record.id === editingId) {
      return (
        <EditableCell
          inputRef={field === "alias" ? editAliasRef : undefined}
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
        <span className="cell-text truncate">{text}</span>
      </Tooltip>
    );
  };

  const columns: ColumnsType<Secret> = [
    {
      title: <ColHeader label="Alias" tooltip="Name to reference this secret in requests" />,
      dataIndex: "alias",
      key: "alias",
      width: "18%",
      render: (text, record) => renderEditableCell(text, record, "alias", "Enter Alias"),
    },
    {
      title: <ColHeader label="ARN/Secret name" tooltip="AWS Secret Manager identifier (ARN or name)" />,
      dataIndex: "arnSecretName",
      key: "arnSecretName",
      render: (text, record) => renderEditableCell(text, record, "arnSecretName", "Enter ARN/Secret name"),
    },
    ...(showVersionId
      ? [
          {
            title: <ColHeader label="Version ID" tooltip="The version ID of the secret value" />,
            dataIndex: "versionId",
            key: "versionId",
            width: "22%",
            render: (text: string, record: Secret) =>
              renderEditableCell(text, record, "versionId", "Version ID (optional)"),
          },
        ]
      : []),
    {
      title: <ColHeader label="Secret" tooltip="Fetched secrets (plain text or key/value)" />,
      dataIndex: "secretValue",
      key: "secretValue",
      render: (_: string, record: Secret) => {
        if (record.id === DRAFT_ID) return null;
        return record.tags && record.tags.length > 0 ? (
          <div className="secret-tags" onClick={() => onViewKeyValues(record.id)} style={{ cursor: "pointer" }}>
            {record.tags.map((tag) => (
              <Tag key={tag} className="secret-tag">
                {tag}
              </Tag>
            ))}
          </div>
        ) : (
          <div className="secret-value-row">
            <span className="secret-dots">{record.isVisible ? record.secretValue : "••••••••••••"}</span>
            <Button
              type="text"
              size="small"
              className="visibility-btn"
              icon={record.isVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              onClick={() => onToggleVisibility(record.id)}
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
      render: (_: any, record: Secret) => {
        const isEditing = record.id === editingId;
        const isDraft = record.id === DRAFT_ID;
        const menu = isDraft
          ? makeInlineMenu(handleSaveDraft, handleCancelDraft)
          : isEditing
          ? makeInlineMenu(handleSaveEdit, handleCancelEdit)
          : {
              items: [
                { key: "edit", icon: <MdOutlineEdit />, label: "Edit", onClick: () => handleStartEdit(record) },
                {
                  key: "delete",
                  icon: <RiDeleteBin6Line />,
                  label: "Delete",
                  danger: true,
                  onClick: () => onDeleteSecret(record.id),
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
    <Table
      className="secrets-antd-table"
      columns={columns}
      dataSource={[
        ...secrets.map((s) => ({ ...s, key: s.id })),
        ...(draftRow
          ? [{ id: DRAFT_ID, key: DRAFT_ID, alias: "", arnSecretName: "", versionId: "", secretValue: "" }]
          : []),
      ]}
      pagination={false}
      size="small"
      bordered
      tableLayout="fixed"
      rowClassName={(record) => {
        if (record.id === DRAFT_ID) return "draft-row";
        if (record.id === editingId) return "editing-row";
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

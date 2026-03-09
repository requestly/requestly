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
import { AwsSecretValue } from "@requestly/shared/types/entities/secretsManager";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import {
  selectSecretsForSelectedProvider,
  selectSelectedProviderId,
  selectFetchErrors,
  selectValidationErrors,
  secretsManagerActions,
} from "features/apiClient/slices/secrets-manager";
import { parseSecretKeyValues } from "../../utils/parseSecretKeyValues";
import "./secretsTable.scss";
import { deleteSecret } from "features/apiClient/slices/secrets-manager/thunks";
import clsx from "clsx";
import { RQButton } from "lib/design-system-v2/components/RQButton/RQButton";

type TableRow = AwsSecretValue & { key: string };

function isStubRow(row: TableRow): boolean {
  return row.fetchedAt === 0;
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

  const fetchErrors = useSelector(selectFetchErrors);
  const validationErrors = useSelector(selectValidationErrors);

  const [showVersionId, setShowVersionId] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const toggleVisibility = useCallback((id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddClick = () => {
    if (!selectedProviderId) {
      return;
    }

    dispatch(secretsManagerActions.addSecretEntry({ providerId: selectedProviderId }));
  };

  const handleRowChange = (row: TableRow, field: "alias" | "identifier" | "version", value: string) => {
    if (!selectedProviderId) return;

    const secretRefId = row.secretReference.id;

    dispatch(
      secretsManagerActions.unsafePatchSecret({
        id: secretRefId,
        patcher: (secret) => {
          if (field === "alias") {
            secret.secretReference.alias = value;
          } else if (field === "identifier") {
            (secret.secretReference as AwsSecretValue["secretReference"]).identifier = value;
          } else if (field === "version") {
            (secret.secretReference as AwsSecretValue["secretReference"]).version = value;
          }
        },
      })
    );
  };

  const handleDelete = (row: TableRow) => {
    if (!selectedProviderId) return;

    if (isStubRow(row)) {
      dispatch(
        secretsManagerActions.removeSecretEntry({
          providerId: selectedProviderId,
          secretRefId: row.secretReference.id,
        })
      );
    } else {
      dispatch(deleteSecret({ providerId: selectedProviderId, secretReference: row.secretReference }));
    }
  };

  const dataSource: TableRow[] = useMemo(() => {
    return secrets.map((s) => ({
      ...s,
      key: s.secretReference.id,
    }));
  }, [secrets]);

  const columns: ColumnsType<TableRow> = [
    {
      title: <ColHeader label="Alias" tooltip="Key to reference this secret in requests via {{secret:ALIAS}}" />,
      key: "alias",
      width: "18%",
      render: (_, row) => {
        const aliasError = validationErrors[row.key]?.alias;
        return (
          <div className={clsx("cell-input-with-error", aliasError && "error-cell")}>
            <Input
              className="draft-cell-input"
              value={row.secretReference.alias}
              placeholder="Enter alias"
              size="small"
              onChange={(e) => handleRowChange(row, "alias", e.target.value)}
            />
            {aliasError && (
              <Tooltip title={aliasError} placement="right" showArrow={false} overlayClassName="error-tooltip">
                <MdErrorOutline className="secret-error-icon" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: <ColHeader label="ARN/Secret name" tooltip="AWS Secret Manager identifier (ARN or name)" />,
      key: "ARN",
      render: (_, row) => {
        const identifierError = validationErrors[row.key]?.identifier;
        return (
          <div className={clsx("cell-input-with-error", identifierError && "error-cell")}>
            <Input
              className="draft-cell-input"
              value={row.secretReference.identifier}
              placeholder="Enter ARN/Secret name"
              size="small"
              onChange={(e) => handleRowChange(row, "identifier", e.target.value)}
            />
            {identifierError && (
              <Tooltip title={identifierError} placement="right" showArrow={false} overlayClassName="error-tooltip">
                <MdErrorOutline className="secret-error-icon" />
              </Tooltip>
            )}
          </div>
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
        const error = fetchErrors[row.key];
        if (error) {
          return (
            <Tooltip title={error} placement="right" showArrow={false} overlayClassName="error-tooltip">
              <div className={clsx("secret-error-cell", error && "error-cell")}>
                <MdErrorOutline className="secret-error-icon" />
              </div>
            </Tooltip>
          );
        }

        if (isStubRow(row)) {
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
                  onClick: () => handleDelete(row),
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
      rowClassName={(row) => (isStubRow(row) ? "draft-row" : "")}
      footer={() => (
        <RQButton type="transparent" icon={<FiPlus />} className="add-secret-btn" onClick={handleAddClick}>
          Add
        </RQButton>
      )}
      locale={{
        emptyText: () => null,
      }}
    />
  );
};

export default SecretsTable;

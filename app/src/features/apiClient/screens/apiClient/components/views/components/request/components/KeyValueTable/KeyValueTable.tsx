import React, { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { Tooltip } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { KeyValueTableEditableRow, KeyValueTableEditableCell } from "./KeyValueTableRow";
import { KeyValueTableSettingsDropdown } from "./KeyValueTableSettingsDropdown";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import "./keyValueTable.scss";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { doesValueMatchDataType } from "features/apiClient/screens/apiClient/utils";
import { capitalize } from "lodash";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  variables: ScopedVariables;
  extraColumns?: {
    description?: {
      visible: boolean;
      onToggle: (show: boolean) => void;
    };
    dataType?: {
      visible: boolean;
    };
  };
  config?: {
    checkInvalidCharacter?: boolean;
  };
  tableType?: string;
  setShowBulkEditPanel?: (show: boolean) => void;
  hideIsEnabled?: boolean;
}

export const KeyValueTable: React.FC<React.PropsWithChildren<KeyValueTableProps>> = ({
  data,
  variables,
  onChange,
  extraColumns,
  config,
  tableType,
  setShowBulkEditPanel,
  hideIsEnabled,
}) => {
  const { checkInvalidCharacter = false } = config || {};

  const isDescriptionVisible =
    hasDescription(extraColumns) &&
    isFeatureCompatible(FEATURES.API_CLIENT_DESCRIPTION_COMPATIBILITY) &&
    extraColumns.description.visible;
  const isDataTypeVisible =
    hasDataType(extraColumns) &&
    extraColumns.dataType.visible &&
    isFeatureCompatible(FEATURES.API_CLIENT_KEY_VALUE_TABLE_DATA_TYPE_COMPATIBILITY);

  const createEmptyPair = useCallback(
    () => ({
      id: Date.now(),
      key: "",
      value: "",
      isEnabled: true,
      description: "",
      dataType: KeyValueDataType.STRING,
    }),
    []
  );

  const memoizedData: KeyValuePair[] = useMemo(() => {
    if (data.length) {
      return data;
    } else {
      const emptyData = createEmptyPair();
      return [emptyData];
    }
  }, [data, createEmptyPair]);

  const handleUpdateRequestPairs = useCallback(
    (pair: KeyValuePair, action: "add" | "update" | "delete") => {
      let keyValuePairs = [...memoizedData];

      if (pair) {
        switch (action) {
          case "add":
            keyValuePairs.push(pair);
            break;
          case "update": {
            const index = keyValuePairs.findIndex((item: KeyValuePair) => item.id === pair.id);
            if (index !== -1) {
              keyValuePairs.splice(index, 1, {
                ...keyValuePairs[index],
                ...pair,
              });
            }
            break;
          }
          case "delete": {
            keyValuePairs = keyValuePairs.filter((item: KeyValuePair) => item.id !== pair.id);
            break;
          }
          default:
            break;
        }
      }

      onChange(keyValuePairs);
    },
    [onChange, memoizedData]
  );

  const handleUpdatePair = useCallback(
    (pair: KeyValuePair) => {
      handleUpdateRequestPairs(pair, "update");
    },
    [handleUpdateRequestPairs]
  );

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    handleUpdateRequestPairs(newPair, "add");
  }, [createEmptyPair, handleUpdateRequestPairs]);

  const handleDeletePair = useCallback(
    (pair: KeyValuePair) => {
      handleUpdateRequestPairs(pair, "delete");
    },
    [handleUpdateRequestPairs]
  );

  const columns = useMemo(() => {
    return [
      !hideIsEnabled
        ? {
            title: "",
            dataIndex: "isEnabled",
            width: "40px",
            editable: true,
            className: "kv-col-border-right",
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "isEnabled",
              title: "isEnabled",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      {
        title: "Key",
        dataIndex: "key",
        width: isDescriptionVisible ? "30%" : "50%",
        editable: true,
        className: "kv-col-border-right",
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "key",
          title: "key",
          variables,
          checkInvalidCharacter,
          handleUpdatePair,
          tableType,
        }),
      },
      {
        title: "Value",
        dataIndex: "value",
        editable: true,
        width: isDescriptionVisible ? "30%" : "50%",
        className: "kv-col-border-right",
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          variables,
          handleUpdatePair,
          error: doesValueMatchDataType(record.value, record.dataType ?? KeyValueDataType.STRING)
            ? null
            : `Value must be ${capitalize(record.dataType ?? KeyValueDataType.STRING)}`,
        }),
      },
      isDataTypeVisible
        ? {
            title: "Type",
            dataIndex: "dataType",
            width: isDescriptionVisible ? 110 : 120,
            editable: true,
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "dataType",
              title: "type",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      isDescriptionVisible
        ? {
            title: "Description",
            dataIndex: "description",
            width: "40%",
            editable: true,
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "description",
              title: "description",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      {
        width: "50px",
        fixed: "right",
        title: () =>
          isDataTypeVisible &&
          hasDescription(extraColumns) && (
            <div className="key-value-table-header-actions">
              <KeyValueTableSettingsDropdown
                showDescription={isDescriptionVisible}
                onToggleDescription={extraColumns.description.onToggle}
              />
              <Tooltip
                title={`Bulk edit ${tableType} as key:value pairs`}
                color="#000000"
                mouseEnterDelay={0.2}
                placement="right"
                overlayClassName="key-value-bulk-edit-tooltip"
              >
                <RQButton
                  size="small"
                  onClick={() => {
                    setShowBulkEditPanel && setShowBulkEditPanel(true);
                  }}
                  className="key-value-bulk-edit-button"
                >
                  Bulk edit
                </RQButton>
              </Tooltip>
            </div>
          ),
        render: (_: any, record: KeyValuePair) => {
          if (record.key === "" && record.value === "" && data.length === 1) {
            return null;
          }

          return (
            <RQButton
              className="key-value-delete-btn"
              icon={<RiDeleteBin6Line />}
              type="transparent"
              size="small"
              onClick={() => handleDeletePair(record)}
            />
          );
        },
      },
    ].filter(Boolean);
  }, [
    isDataTypeVisible,
    isDescriptionVisible,
    variables,
    handleUpdatePair,
    checkInvalidCharacter,
    extraColumns,
    data.length,
    handleDeletePair,
    tableType,
    setShowBulkEditPanel,
  ]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered={false}
      showHeader={isDataTypeVisible}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={memoizedData}
      locale={{ emptyText: `No entries found` }}
      components={{
        body: {
          row: KeyValueTableEditableRow,
          cell: KeyValueTableEditableCell,
        },
      }}
      scroll={{ x: 550 }}
      footer={
        hideIsEnabled
          ? undefined
          : () => (
              <div className="api-key-value-table-footer">
                <RQButton icon={<MdAdd />} size="small" onClick={handleAddPair} className="key-value-add-more-btn">
                  Add More
                </RQButton>
              </div>
            )
      }
    />
  );
};

function hasDescription<T extends { description?: unknown }>(
  config?: T
): config is T & { description: NonNullable<T["description"]> } {
  return !!config && !!config.description;
}

function hasDataType<T extends { dataType?: unknown }>(
  config?: T
): config is T & { dataType: NonNullable<T["dataType"]> } {
  return !!config && !!config.dataType;
}

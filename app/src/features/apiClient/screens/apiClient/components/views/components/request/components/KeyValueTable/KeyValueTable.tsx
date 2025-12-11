import React, { useCallback, useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { KeyValueTableEditableRow, KeyValueTableEditableCell } from "./KeyValueTableRow";
import { KeyValueTableSettingsDropdown } from "./KeyValueTableSettingsDropdown";
import { KeyValuePair, ValueType } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import "./keyValueTable.scss";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { validateValue } from "features/apiClient/screens/apiClient/utils";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  variables: ScopedVariables;
  checkInvalidCharacter?: boolean;
  showDescription?: boolean;
  showType?: boolean;
  showSettings?: boolean;
  onToggleDescription?: (show: boolean) => void;
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  data,
  variables,
  onChange,
  checkInvalidCharacter = false,
  showDescription = true,
  showType = true,
  showSettings = true,
  onToggleDescription = () => {},
}) => {
  const createEmptyPair = useCallback(
    () => ({
      id: Date.now(),
      key: "",
      value: "",
      isEnabled: true,
      description: "",
      dataType: ValueType.STRING,
    }),
    []
  );

  const memoizedData: KeyValuePair[] = useMemo(() => {
    if (data.length) {
      return data;
    } else {
      const emptyData = createEmptyPair();
      emptyData.isEnabled = false;
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
      {
        title: "",
        dataIndex: "isEnabled",
        width: "50px",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "isEnabled",
          title: "isEnabled",
          variables,
          handleUpdatePair,
        }),
      },
      {
        title: "Key",
        dataIndex: "key",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "key",
          title: "key",
          variables,
          checkInvalidCharacter,
          handleUpdatePair,
        }),
      },
      {
        title: "Value",
        dataIndex: "value",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          variables,
          handleUpdatePair,
          error: validateValue(record.value, record.dataType),
        }),
      },
      showType && isFeatureCompatible(FEATURES.API_CLIENT_TYPE_COMPATIBILITY)
        ? {
            title: "Type",
            dataIndex: "dataType",
            width: 120,
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
      showDescription && isFeatureCompatible(FEATURES.API_CLIENT_DESCRIPTION_COMPATIBILITY)
        ? {
            title: "Description",
            dataIndex: "description",
            minWidth: 200,
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
          showSettings &&
          isFeatureCompatible(FEATURES.API_CLIENT_TYPE_COMPATIBILITY) && (
            <KeyValueTableSettingsDropdown
              showDescription={showDescription}
              onToggleDescription={onToggleDescription}
            />
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
    variables,
    handleUpdatePair,
    checkInvalidCharacter,
    data,
    handleDeletePair,
    showDescription,
    onToggleDescription,
  ]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={true}
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
      footer={() => (
        <div className="api-key-value-table-footer">
          <RQButton icon={<MdAdd />} size="small" onClick={handleAddPair}>
            Add More
          </RQButton>
        </div>
      )}
    />
  );
};

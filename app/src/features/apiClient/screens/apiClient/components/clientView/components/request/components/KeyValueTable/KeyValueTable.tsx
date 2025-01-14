import React, { useCallback, useEffect, useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { EditableRow, EditableCell } from "./KeyValueTableRow";
import { KeyValueFormType, KeyValuePair, QueryParamSyncType, RQAPI } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { EnvironmentVariables } from "backend/environment/types";
import { syncQueryParams } from "features/apiClient/screens/apiClient/utils";
import "./keyValueTable.scss";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  pairType: KeyValueFormType;
  variables: EnvironmentVariables;
  setKeyValuePairs: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

// TODO: REFACTOR TYPES

export const KeyValueTable: React.FC<KeyValueTableProps> = ({ data, setKeyValuePairs, pairType, variables }) => {
  const handleUpdateRequestPairs = useCallback(
    (prev: RQAPI.Entry, pairType: KeyValueFormType, action: "add" | "update" | "delete", pair?: KeyValuePair) => {
      const updatedRequest = { ...prev.request };
      const pairTypeToUpdate = pairType === KeyValueFormType.FORM ? "body" : pairType;
      let keyValuePairs = Array.isArray(updatedRequest[pairTypeToUpdate]) ? [...updatedRequest[pairTypeToUpdate]] : [];

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

      return {
        ...prev,
        request: {
          ...updatedRequest,
          [pairTypeToUpdate]: keyValuePairs,
          ...(pairType === KeyValueFormType.QUERY_PARAMS
            ? syncQueryParams(keyValuePairs, updatedRequest.url, QueryParamSyncType.URL)
            : {}),
        },
      };
    },
    []
  );

  const handleUpdatePair = useCallback(
    (pair: KeyValuePair) => {
      setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "update", pair));
    },
    [setKeyValuePairs, pairType, handleUpdateRequestPairs]
  );

  const createEmptyPair = useCallback(
    () => ({
      id: Date.now(),
      key: "",
      value: "",
      isEnabled: true,
    }),
    []
  );

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "add", newPair));
  }, [setKeyValuePairs, createEmptyPair, pairType, handleUpdateRequestPairs]);

  const handleDeletePair = useCallback(
    (pair: KeyValuePair) => {
      setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "delete", pair));
    },
    [setKeyValuePairs, pairType, handleUpdateRequestPairs]
  );

  useEffect(() => {
    if (data.length === 0) {
      handleAddPair();
    }
  }, [data, handleAddPair]);

  const columns = useMemo(() => {
    return [
      {
        title: "isEnabled",
        dataIndex: "isEnabled",
        width: "50px",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "isEnabled",
          title: "isEnabled",
          pairType,
          variables,
          handleUpdatePair,
        }),
      },
      {
        title: "key",
        dataIndex: "key",
        width: "45%",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "key",
          title: "key",
          pairType,
          variables,
          handleUpdatePair,
        }),
      },
      {
        title: "value",
        dataIndex: "value",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          pairType,
          variables,
          handleUpdatePair,
        }),
      },
      {
        title: "",
        width: "50px",
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
    ];
  }, [pairType, handleUpdatePair, handleDeletePair, data.length, variables]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={false}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={data}
      locale={{ emptyText: `No ${pairType} found` }}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
      scroll={{ x: true }}
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

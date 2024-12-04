import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { EditableRow, EditableCell } from "./KeyValueTableRow";
import { KeyValueFormType, KeyValuePair, RQAPI } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { isArray } from "lodash";
import "./keyValueTable.scss";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  pairType: KeyValueFormType;
  setKeyValuePairs: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry, isInit?: boolean) => void;
}

// TODO: REFACTOR TYPES

export const KeyValueTable: React.FC<KeyValueTableProps> = ({ data, setKeyValuePairs, pairType }) => {
  const [tableData, setTableData] = useState<KeyValuePair[]>(data);

  const handleUpdateRequestPairs = useCallback(
    (prev: RQAPI.Entry, pairType: KeyValueFormType, action: "add" | "update" | "delete", pair?: KeyValuePair) => {
      const updatedRequest = { ...prev.request };
      const pairTypeToUpdate = pairType === KeyValueFormType.FORM ? "body" : pairType;
      let keyValuePairs = updatedRequest[pairTypeToUpdate] as KeyValuePair[];
      if (!isArray(keyValuePairs)) keyValuePairs = [];

      switch (action) {
        case "add":
          if (pair) keyValuePairs.push(pair);
          break;
        case "update":
          if (pair) {
            const index = keyValuePairs.findIndex((item: KeyValuePair) => item.id === pair.id);
            if (index !== -1) {
              keyValuePairs.splice(index, 1, {
                ...keyValuePairs[index],
                ...pair,
              });
            }
            setTableData(() => [...keyValuePairs]);
          }
          break;
        case "delete":
          return {
            ...prev,
            request: {
              ...updatedRequest,
              [pairTypeToUpdate]: keyValuePairs.filter((item: KeyValuePair) => item.id !== pair?.id),
            },
          };
      }
      return { ...prev, request: updatedRequest };
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

  const handleAddPair = useCallback(
    (isInitPair = false) => {
      const newPair = createEmptyPair();
      setTableData((prev) => [...prev, newPair]);
      setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "add", newPair), isInitPair);
    },
    [setKeyValuePairs, createEmptyPair, pairType, handleUpdateRequestPairs]
  );

  const handleDeletePair = useCallback(
    (pair: KeyValuePair) => {
      const newData = tableData.filter((item) => item.id !== pair.id);
      setTableData(newData);
      setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "delete", pair));
    },
    [setKeyValuePairs, pairType, tableData, handleUpdateRequestPairs]
  );

  useEffect(() => {
    if (tableData.length === 0) {
      handleAddPair(true);
    }
  }, [tableData, handleAddPair]);

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
          handleUpdatePair,
        }),
      },
      {
        title: "",
        width: "50px",
        render: (_: any, record: KeyValuePair) => {
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
  }, [pairType, handleUpdatePair, handleDeletePair]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={false}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={tableData}
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
          <RQButton icon={<MdAdd />} size="small" onClick={() => handleAddPair(false)}>
            Add More
          </RQButton>
        </div>
      )}
    />
  );
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { EditableRow, EditableCell } from "./KeyValueTableRow";
import { KeyValueFormType, KeyValuePair, RQAPI } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { isArray } from "lodash";
import { EnvironmentVariables } from "backend/environment/types";
import "./keyValueTable.scss";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  wrapperClass?: string;
  data: KeyValuePair[];
  pairType: KeyValueFormType;
  variables: EnvironmentVariables;
  setKeyValuePairs: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

// TODO: REFACTOR TYPES

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  wrapperClass,
  data,
  setKeyValuePairs,
  pairType,
  variables,
}) => {
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
          return {
            ...prev,
            request: {
              ...prev.request,
              [pairTypeToUpdate]: [...keyValuePairs],
            },
          };
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
            return {
              ...prev,
              request: {
                ...prev.request,
                [pairTypeToUpdate]: [...keyValuePairs],
              },
            };
          }
          return { ...prev };
        case "delete":
          return {
            ...prev,
            request: {
              ...updatedRequest,
              [pairTypeToUpdate]: keyValuePairs.filter((item: KeyValuePair) => item.id !== pair?.id),
            },
          };
      }
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
      isEditable: true,
    }),
    []
  );

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    setTableData((prev) => [...prev, newPair]);
    setKeyValuePairs((prev) => handleUpdateRequestPairs(prev, pairType, "add", newPair));
  }, [setKeyValuePairs, createEmptyPair, pairType, handleUpdateRequestPairs]);

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
      handleAddPair();
    }
  }, [tableData, handleAddPair]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const columns = useMemo(() => {
    return [
      {
        title: "isEnabled",
        dataIndex: "isEnabled",
        width: "50px",
        editable: true,
        onCell: (record: KeyValuePair) => ({
          record,
          editable: record.isEditable,
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
          editable: record.isEditable,
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
          editable: record.isEditable,
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
          if ((record.key === "" && record.value === "" && tableData.length === 1) || !record.isEditable) {
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
  }, [pairType, handleUpdatePair, handleDeletePair, tableData.length, variables]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className={`api-key-value-table ${wrapperClass}`}
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
          <RQButton icon={<MdAdd />} size="small" onClick={handleAddPair}>
            Add More
          </RQButton>
        </div>
      )}
    />
  );
};

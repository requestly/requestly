import React, { useCallback, useEffect, useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { EditableRow, EditableCell } from "./KeyValueTableRow";
import { KeyValueFormType, KeyValuePair } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import "./keyValueTable.scss";

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  pairtype: KeyValueFormType;
  setKeyValuePairs: (keyValuePairs: KeyValuePair[]) => void;
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({ data, setKeyValuePairs, pairtype }) => {
  const handleUpdatePair = useCallback(
    (pair: KeyValuePair) => {
      const newData = [...data];
      const index = newData.findIndex((item) => pair.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...pair,
      });
      setKeyValuePairs(newData);
    },
    [data, setKeyValuePairs]
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
    setKeyValuePairs([...data, newPair]);
  }, [data, setKeyValuePairs, createEmptyPair]);

  const handleDeletePair = useCallback(
    (id: number) => {
      const newData = data.filter((item) => item.id !== id);
      setKeyValuePairs(newData);
    },
    [data, setKeyValuePairs]
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
          pairtype,
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
          pairtype,
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
          pairtype,
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
              onClick={() => handleDeletePair(record.id)}
            />
          );
        },
      },
    ];
  }, [pairtype, handleUpdatePair]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={false}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={data}
      locale={{ emptyText: `No ${pairtype} found` }}
      components={{
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      }}
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

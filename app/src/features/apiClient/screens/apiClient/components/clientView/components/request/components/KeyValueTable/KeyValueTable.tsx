import React, { useCallback } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { EditableRow, EditableCell } from "./KeyValueTableRow";
import { KeyValueFormType, KeyValuePair } from "features/apiClient/types";
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

  React.useEffect(() => {
    if (data.length === 0) {
      handleAddPair();
    }
  }, []);

  const columns = [
    {
      title: "isEnabled",
      dataIndex: "isEnabled",
      width: "50px",
      editable: false,
      onCell: (record: KeyValuePair) => ({
        record,
        editable: false,
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
  ];

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={false}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={data}
      locale={{ emptyText: "No variables found" }}
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

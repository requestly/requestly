import { ContentListTable } from "componentsV2/ContentList";
import { FormDropDownOptions, RQAPI } from "features/apiClient/types";
import React, { useCallback, useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { TableProps } from "antd";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MultiEditableCell, MultiEditableRow } from "./MultiPartFormTableRow";
import "./MultiPartFormTable.scss";
import { EnvironmentVariables } from "backend/environment/types";
import { useApiClientFileStore } from "features/apiClient/hooks/useApiClientFileStore.hook";

type ColumnTypes = Exclude<TableProps<RQAPI.FormDataKeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: RQAPI.FormDataKeyValuePair[];
  onChange: (updatedPairs: RQAPI.FormDataKeyValuePair[]) => void;
  checkInvalidCharacter?: boolean;
  variables: EnvironmentVariables;
}

export const MultiPartFormTable: React.FC<KeyValueTableProps> = ({
  data,
  onChange,
  variables,
  checkInvalidCharacter = false,
}) => {
  const createEmptyPair = useCallback(() => {
    return {
      id: Date.now(),
      key: "",
      value: "",
      isEnabled: true,
      type: FormDropDownOptions.TEXT,
    };
  }, []);

  const memoizedData = useMemo(() => (data.length ? data : [createEmptyPair()]), [createEmptyPair, data]);

  const { removeFile } = useApiClientFileStore((state) => state);

  const handleUpdateRequestPairs = useCallback(
    (pair: RQAPI.FormDataKeyValuePair, action: "add" | "remove" | "update") => {
      let FormDataKeyValuePairs = [...memoizedData];
      if (pair) {
        switch (action) {
          case "add":
            FormDataKeyValuePairs.push(pair);
            break;
          case "update": {
            const index = FormDataKeyValuePairs.findIndex((item: RQAPI.FormDataKeyValuePair) => item.id === pair.id);
            if (index !== -1) {
              FormDataKeyValuePairs.splice(index, 1, {
                ...FormDataKeyValuePairs[index],
                ...pair,
              });
            }
            break;
          }
          case "remove": {
            FormDataKeyValuePairs = FormDataKeyValuePairs.filter(
              (item: RQAPI.FormDataKeyValuePair) => item.id !== pair.id
            );
            break;
          }
          default:
            break;
        }
      }

      onChange(FormDataKeyValuePairs);
    },
    [memoizedData, onChange]
  );

  const handleUpdatePair = useCallback(
    (pair: RQAPI.FormDataKeyValuePair) => {
      //this is called to update the anything changed in a record(Row)
      /*
      1. File changes
      2. Text changes
      these are also covered in this
      */

      handleUpdateRequestPairs(pair, "update");
    },
    [handleUpdateRequestPairs]
  );

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    //this is called to add a new record to the table(Row)
    handleUpdateRequestPairs(newPair, "add");
  }, [createEmptyPair, handleUpdateRequestPairs]);

  const handleDeletePair = useCallback(
    (pair: RQAPI.FormDataKeyValuePair) => {
      //this is called to remove the whole record from the table(Row)
      handleUpdateRequestPairs(pair, "remove");

      //remove from file store as well
      if (Array.isArray(pair.value)) {
        pair.value.forEach((file) => {
          removeFile(file.id);
        });
      }
    },
    [handleUpdateRequestPairs, removeFile]
  );

  const columns = useMemo(() => {
    return [
      {
        title: "isEnabled",
        dataIndex: "isEnabled",
        width: "50px",
        editable: true,
        onCell: (record: RQAPI.FormDataKeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "isEnabled",
          title: "isEnabled",
          variables,
          handleUpdatePair,
        }),
      },
      {
        title: "key",
        dataIndex: "key",
        width: "45%",
        editable: true,
        onCell: (record: RQAPI.FormDataKeyValuePair) => ({
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
        title: "value",
        dataIndex: "value",
        editable: true,
        onCell: (record: RQAPI.FormDataKeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "value",
          variables,
          title: "value",
          handleUpdatePair,
        }),
      },
      {
        title: "",
        width: "50px",
        render: (_: any, record: RQAPI.FormDataKeyValuePair) => {
          if (record.key === "" && record.value === "" && data.length === 1) {
            return null;
          }
          return (
            <RQButton
              className="key-value-delete-icon"
              icon={<RiDeleteBin6Line />}
              type="transparent"
              size="small"
              onClick={() => handleDeletePair(record)}
            />
          );
        },
      },
    ];
  }, [checkInvalidCharacter, data.length, handleDeletePair, handleUpdatePair, variables]);

  return (
    <ContentListTable
      id="api-key-value-table"
      className="api-key-value-table"
      bordered
      showHeader={false}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={memoizedData}
      locale={{ emptyText: `No entries found` }}
      components={{
        body: {
          row: MultiEditableRow,
          cell: MultiEditableCell,
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

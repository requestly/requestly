import { TableProps } from "antd";
import { EnvironmentVariableValue } from "backend/environmentVariables/types";

type EnvironmentVariableTable = EnvironmentVariableValue & { key: string };

interface Props {
  handleSave: (record: EnvironmentVariableTable, dataIndex: string, value: string) => void;
}

type ColumnTypes = Exclude<TableProps<EnvironmentVariableTable>["columns"], undefined>;

export const useVariablesListColumns = ({ handleSave }: Props) => {
  const columns: (ColumnTypes[number] & { editable: boolean })[] = [
    {
      title: "Key",
      editable: true,
      onCell: (record: EnvironmentVariableTable) => ({
        record,
        editable: true,
        dataIndex: "key",
        title: "Key",
        handleSave,
        inputType: "text",
      }),
    },
    {
      title: "Type",
      editable: true,
      width: "150px",
      onCell: (record: EnvironmentVariableTable) => ({
        record,
        editable: true,
        dataIndex: "type",
        title: "Type",
        handleSave,
        inputType: "select",
        options: ["String", "Number", "Boolean"],
      }),
    },
    {
      title: "Local Value",
      editable: true,
      onCell: (record: EnvironmentVariableTable) => ({
        record,
        editable: true,
        dataIndex: "localValue",
        title: "Local Value",
        handleSave,
        inputType: "text",
      }),
    },
    {
      title: "Sync Value",
      editable: true,
      onCell: (record: EnvironmentVariableTable) => ({
        record,
        editable: true,
        dataIndex: "syncValue",
        title: "Sync Value",
        handleSave,
        inputType: "text",
      }),
    },
  ];

  return columns;
};

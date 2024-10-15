import { TableProps, Tooltip } from "antd";
import { EnvironmentVariableTableRow } from "../VariablesList";
import { RQButton } from "lib/design-system-v2/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";

interface Props {
  handleSaveVariables: (record: EnvironmentVariableTableRow) => void;
  handleDeleteVariable: (key: string) => void;
}

type ColumnTypes = Exclude<TableProps<EnvironmentVariableTableRow>["columns"], undefined>;

export const useVariablesListColumns = ({ handleSaveVariables, handleDeleteVariable }: Props) => {
  const columns: (ColumnTypes[number] & { editable: boolean })[] = [
    {
      title: "Key",
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "key",
        title: "Key",
        handleSaveVariables,
        inputType: "text",
      }),
    },
    {
      title: "Type",
      editable: true,
      width: "150px",
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "type",
        title: "Type",
        handleSaveVariables,
        inputType: "select",
        options: ["string", "number", "boolean"],
      }),
    },
    {
      title: (
        <div className="variable-value-column-title">
          Initial Value{" "}
          <Tooltip
            color="#000"
            title="Initial values will be synced across the workspace. These default values will be used if no user-defined value is set for the variable."
          >
            <span className="synced-tag">SYNCED</span>
          </Tooltip>
        </div>
      ),
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "syncValue",
        title: "Sync Value",
        handleSaveVariables,
        inputType: "text",
      }),
    },
    {
      title: (
        <div className="variable-value-column-title">
          Current Value{" "}
          <Tooltip
            color="#000"
            title="Current values are specific to the user and are not synced across the workspace. These values can be overridden by user-defined values for the variable."
          >
            <span className="local-tag">LOCAL</span>
          </Tooltip>
        </div>
      ),
      editable: true,
      onCell: (record) => ({
        record,
        editable: true,
        dataIndex: "localValue",
        title: "Local Value",
        handleSaveVariables,
        inputType: "text",
      }),
    },
    {
      title: "",
      editable: false,
      width: "50px",
      render: (_: any, record) => {
        return (
          <RQButton
            icon={<RiDeleteBin6Line />}
            type="transparent"
            size="small"
            className="delete-variable-btn"
            onClick={() => handleDeleteVariable(record.key)}
          />
        );
      },
    },
  ];

  return columns;
};

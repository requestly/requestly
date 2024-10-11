import React, { useState, useEffect, useContext } from "react";
import { useVariablesListColumns } from "./hooks/useVariablesListColumns";
import { Input, Table, Select, Form, Button, Spin } from "antd";
import useEnvironmentVariables from "backend/environmentVariables/hooks/useEnvironmentVariables";
import { EnvironmentVariableTable, VariableType } from "features/apiClient/screens/environments/types";
import type { FormInstance } from "antd";

const { Option } = Select;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof EnvironmentVariableTable;
  record: EnvironmentVariableTable;
  handleSave: (record: EnvironmentVariableTable) => void;
  inputType: "text" | "select";
  options?: string[];
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType,
  options,
  ...restProps
}) => {
  const form = useContext(EditableContext)!;

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  return (
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {inputType === "select" ? (
          <Select style={{ width: "100%" }} onChange={save}>
            {options?.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        ) : (
          <Input onBlur={save} onPressEnter={save} />
        )}
      </Form.Item>
    </td>
  );
};

export const VariablesList: React.FC = () => {
  const { getAllVariables, setVariable, isVariablesLoading } = useEnvironmentVariables();
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [dataSource, setDataSource] = useState<EnvironmentVariableTable[]>([]);

  console.log("EditableCell");

  const handleSave = (row: EnvironmentVariableTable) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);

    console.log("row", row, item, newData);

    if (row.key) {
      setVariable(row.key, row);
    }
  };

  // const handleDelete = (key: React.Key) => {
  //   const newData = dataSource.filter((item) => item.id !== key);
  //   setDataSource(newData);
  // };

  const handleAdd = () => {
    const newData: EnvironmentVariableTable = {
      id: dataSource.length + 1,
      key: "",
      type: VariableType.String,
      localValue: "",
      syncValue: "",
    };
    setDataSource([...dataSource, newData]);
  };

  const columns = useVariablesListColumns({ handleSave });

  useEffect(() => {
    if (!isVariablesLoading && !isTableLoaded) {
      setIsTableLoaded(true);
      const variables = getAllVariables();
      const formattedDataSource: EnvironmentVariableTable[] = Object.entries(variables).map(([key, value], index) => ({
        id: index,
        key,
        type: value.type,
        localValue: value.localValue,
        syncValue: value.syncValue,
      }));
      if (formattedDataSource.length === 0) {
        formattedDataSource.push({
          id: 0,
          key: "",
          type: VariableType.String,
          localValue: "",
          syncValue: "",
        });
      }
      setDataSource(formattedDataSource);
    }
  }, [getAllVariables, isVariablesLoading, isTableLoaded]);

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  if (isVariablesLoading) {
    return <Spin />;
  }

  return (
    <div>
      <Button onClick={handleAdd} type="primary">
        Add a row
      </Button>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};

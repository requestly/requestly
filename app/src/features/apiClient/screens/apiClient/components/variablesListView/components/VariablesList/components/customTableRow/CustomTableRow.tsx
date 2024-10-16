import { Form, FormInstance, Input, Select } from "antd";
import React, { useCallback, useContext, useMemo } from "react";
import { EnvironmentVariableTableRow } from "../../VariablesList";
import { VariableType } from "backend/environment/types";
import debounce from "lodash/debounce";
import Logger from "lib/logger";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof EnvironmentVariableTableRow;
  record: EnvironmentVariableTableRow;
  handleSaveVariable: (record: EnvironmentVariableTableRow) => void;
  inputType: "text" | "select";
  options?: string[];
}

export const EditableRow = ({ index, ...props }: { index: number }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSaveVariable,
  inputType,
  options,
  ...restProps
}) => {
  const form = useContext(EditableContext)!;

  const convertValueByType = useCallback((value: any, type: VariableType) => {
    switch (type) {
      case VariableType.Number:
        return Number(value);
      case VariableType.Boolean:
        return Boolean(value);
      case VariableType.String:
      default:
        return String(value);
    }
  }, []);

  const handleSaveCellValue = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const updatedRecord = { ...record, ...values };

      updatedRecord.syncValue = convertValueByType(updatedRecord.syncValue, updatedRecord.type);
      updatedRecord.localValue = convertValueByType(updatedRecord.localValue, updatedRecord.type);

      handleSaveVariable(updatedRecord);
    } catch (errInfo) {
      Logger.log("Save failed:", errInfo);
    }
  }, [form, record, handleSaveVariable, convertValueByType]);

  const debouncedSave = useMemo(() => debounce(handleSaveCellValue, 2000), [handleSaveCellValue]);

  const handleChange = useCallback(
    (value: string) => {
      form.setFieldsValue({ [dataIndex]: value });
      debouncedSave();
    },
    [form, dataIndex, debouncedSave]
  );

  const getPlaceholderText = () => {
    if (dataIndex === "key") {
      return "Add new variable";
    }
    return "Enter value";
  };

  const validateValue = useCallback(
    (rule: unknown, value: any) => {
      if (value === "" || value === undefined) {
        return Promise.resolve();
      }

      if (dataIndex === "syncValue" || dataIndex === "localValue") {
        switch (record.type) {
          case VariableType.Number:
            if (isNaN(Number(value))) {
              return Promise.reject();
            }
            break;
          case VariableType.Boolean:
            if (value.toLowerCase() !== "true" && value.toLowerCase() !== "false") {
              return Promise.reject();
            }
            break;
        }
      }
      return Promise.resolve();
    },
    [dataIndex, record?.type]
  );

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  return (
    <td {...restProps}>
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        initialValue={record?.[dataIndex]}
        rules={[{ validator: validateValue }]}
      >
        {inputType === "select" ? (
          <Select className="w-full" onChange={handleSaveCellValue} defaultValue={VariableType.String}>
            {options?.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Input onChange={(e) => handleChange(e.target.value)} placeholder={getPlaceholderText()} />
        )}
      </Form.Item>
    </td>
  );
};

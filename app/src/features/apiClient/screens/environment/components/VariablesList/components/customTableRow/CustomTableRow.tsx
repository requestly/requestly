import { Form, FormInstance, Input, InputNumber, Select, Tooltip } from "antd";
import React, { useCallback, useContext, useRef, useEffect } from "react";
import { EnvironmentVariableType } from "backend/environment/types";
import Logger from "lib/logger";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { VariableRow } from "../../VariablesList";
import EnumSelect from "./EnumSelect";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

export enum CellType {
  Input = "input",
  TOGGLE_SECRET = "toggle_secret",
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof VariableRow;
  record: VariableRow;
  handleVariableChange: (record: VariableRow, fieldChanged: keyof VariableRow) => void;
  isSecret?: boolean;
  options?: string[];
  duplicateKeyIndices?: Set<number>;
  isReadOnly: boolean;
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
  handleVariableChange,
  options,
  isSecret,
  duplicateKeyIndices,
  isReadOnly,
  ...restProps
}) => {
  const form = useContext(EditableContext)!;
  const inputRef = useRef(null);

  const handleTypeChange = useCallback(
    (value: EnvironmentVariableType) => {
      const defaultValues = {
        syncValue: record.syncValue,
        localValue: record.localValue,
      };

      switch (value) {
        case EnvironmentVariableType.Boolean:
          defaultValues.syncValue = Boolean(defaultValues.syncValue ?? true);
          defaultValues.localValue = Boolean(defaultValues.localValue ?? true);
          break;
        case EnvironmentVariableType.Number:
          defaultValues.syncValue = isNaN(defaultValues.syncValue as number) ? 0 : Number(defaultValues.syncValue);
          defaultValues.localValue = isNaN(defaultValues.localValue as number) ? 0 : Number(defaultValues.localValue);

          break;
        case EnvironmentVariableType.String:
          defaultValues.syncValue = String(defaultValues.syncValue ?? "");
          defaultValues.localValue = String(defaultValues.localValue ?? "");

          break;
        default:
          break;
      }

      handleVariableChange({ ...record, type: value, ...defaultValues }, "type");
    },
    [record, handleVariableChange]
  );

  const handleValueChange = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const updatedRecord = { ...record, ...values };

      handleVariableChange(updatedRecord, dataIndex);
    } catch (errInfo) {
      Logger.log("Save failed:", errInfo);
    }
  }, [dataIndex, handleVariableChange, record, form]);

  const handleChange = useCallback(
    (value: string | number | boolean | EnvironmentVariableType) => {
      if (dataIndex === "type") {
        handleTypeChange(value as EnvironmentVariableType);
      } else {
        handleValueChange();
      }
    },
    [dataIndex, handleTypeChange, handleValueChange]
  );

  const getPlaceholderText = useCallback((dataIndex: string) => {
    if (dataIndex === "key") {
      return "Add new variable";
    }
    return "Enter value";
  }, []);

  const renderValueInputByType = useCallback(() => {
    const disabled = isReadOnly;

    switch (record.type) {
      case EnvironmentVariableType.String:
        return (
          <Input
            ref={inputRef}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );

      case EnvironmentVariableType.Secret:
        return (
          <Input
            type={isSecret ? "password" : "text"}
            ref={inputRef}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );

      case EnvironmentVariableType.Number:
        return (
          <InputNumber
            type="number"
            disabled={disabled}
            controls={false}
            ref={inputRef}
            onChange={(value) => handleChange(value!)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );

      case EnvironmentVariableType.Boolean:
        return (
          <Select
            disabled={disabled}
            onChange={(value) => handleChange(value)}
            value={record[dataIndex]}
            placeholder="Select value"
          >
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        );

      case EnvironmentVariableType.Enum:
        return (
          <EnumSelect
            disabled={disabled}
            value={record[dataIndex] as string}
            onChange={(val) => handleVariableChange({ ...record, [dataIndex]: val }, dataIndex)}
            initialOptions={options}
          />
        );
    }
  }, [isReadOnly, record, handleChange, dataIndex, getPlaceholderText, isSecret]);

  useEffect(() => {
    // Update form fields when record changes non-user actions like syncing variables from listener
    if (editable && record) {
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    }
  }, [form, record, dataIndex, editable]);

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  return (
    <td {...restProps} style={{ position: "relative" }}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {dataIndex === "type" ? (
          <Select
            disabled={isReadOnly}
            className="w-full"
            onChange={(value) => handleChange(value as EnvironmentVariableType)}
            value={record.type}
          >
            {options?.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        ) : dataIndex === "key" ? (
          <Input
            disabled={isReadOnly}
            ref={inputRef}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
            suffix={
              duplicateKeyIndices?.has(record.id) ? (
                <Tooltip title="This variable has been overwritten by a duplicate key." color="#000">
                  <MdOutlineWarningAmber className="warning" />
                </Tooltip>
              ) : (
                <></>
              )
            }
          />
        ) : (
          renderValueInputByType()
        )}
      </Form.Item>
    </td>
  );
};

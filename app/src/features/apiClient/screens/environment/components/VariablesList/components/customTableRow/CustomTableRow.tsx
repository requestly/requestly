import { Form, FormInstance, Input, InputNumber, Select, Tooltip } from "antd";
import React, { useCallback, useContext, useRef, useEffect } from "react";
import { EnvironmentVariableTableRow } from "../../VariablesList";
import { EnvironmentVariableType } from "backend/environment/types";
import Logger from "lib/logger";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

export enum CellType {
  Input = "input",
  TOGGLE_SECRET = "toggle_secret",
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof EnvironmentVariableTableRow;
  record: EnvironmentVariableTableRow;
  handleVariableChange: (record: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => void;
  isSecret?: boolean;
  options?: string[];
  duplicateKeyIndices?: Set<number>;
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
  ...restProps
}) => {
  const form = useContext(EditableContext)!;
  const inputRef = useRef(null);

  const convertValueByType = useCallback((value: any, type: EnvironmentVariableType) => {
    if (value === undefined) {
      return "";
    }
    switch (type) {
      case EnvironmentVariableType.Number:
        return Number(value);
      case EnvironmentVariableType.Boolean:
        return Boolean(value);
      case EnvironmentVariableType.String:
      default:
        return String(value);
    }
  }, []);

  const handleTypeChange = useCallback(
    (value: EnvironmentVariableType, prevType: EnvironmentVariableType) => {
      const defaultValues = {
        syncValue: record.syncValue,
        localValue: record.localValue,
      };

      switch (value) {
        case EnvironmentVariableType.Boolean:
          defaultValues.syncValue = true;
          defaultValues.localValue = true;
          break;
        case EnvironmentVariableType.Number:
          defaultValues.syncValue = 0;
          defaultValues.localValue = 0;
          break;
        case EnvironmentVariableType.String:
          if (prevType !== EnvironmentVariableType.Secret) {
            defaultValues.syncValue = "";
            defaultValues.localValue = "";
          }
          break;
        case EnvironmentVariableType.Secret:
          if (prevType !== EnvironmentVariableType.String) {
            defaultValues.syncValue = "";
            defaultValues.localValue = "";
          }
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

      updatedRecord.syncValue = convertValueByType(updatedRecord.syncValue, updatedRecord.type);
      updatedRecord.localValue = convertValueByType(updatedRecord.localValue, updatedRecord.type);

      handleVariableChange(updatedRecord, dataIndex);
    } catch (errInfo) {
      Logger.log("Save failed:", errInfo);
    }
  }, [dataIndex, handleVariableChange, record, convertValueByType, form]);

  const handleChange = useCallback(
    (
      value: string | number | boolean | EnvironmentVariableType,
      prevValue?: string | number | boolean | EnvironmentVariableType
    ) => {
      if (dataIndex === "type") {
        handleTypeChange(value as EnvironmentVariableType, prevValue as EnvironmentVariableType);
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
    switch (record.type) {
      case EnvironmentVariableType.String:
        return (
          <Input
            ref={inputRef}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );

      case EnvironmentVariableType.Secret:
        return (
          <Input
            type={isSecret ? "password" : "text"}
            ref={inputRef}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );

      case EnvironmentVariableType.Number:
        return (
          <InputNumber
            type="number"
            controls={false}
            ref={inputRef}
            onChange={(value) => handleChange(value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        );
      case EnvironmentVariableType.Boolean:
        return (
          <Select onChange={(value) => handleChange(value)} value={record[dataIndex]} placeholder="Select value">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        );
    }
  }, [record, handleChange, dataIndex, getPlaceholderText, isSecret]);

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
            className="w-full"
            onChange={(value) => handleChange(value as EnvironmentVariableType, record.type)}
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

import { Form, FormInstance, Input, InputNumber, Select, Tooltip } from "antd";
import React, { useCallback, useContext, useRef, useEffect, useState } from "react";
import { EnvironmentVariableTableRow } from "../../VariablesList";
import { EnvironmentVariableType } from "backend/environment/types";
import Logger from "lib/logger";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { isEmpty } from "lodash";

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
  const [previousValues, setPreviousValues] = useState<{ [key: string]: any }>({});

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
    (newType: EnvironmentVariableType, prevType: EnvironmentVariableType) => {
      const previousValue = previousValues[prevType] || {};
      const currentValue = previousValues[newType] || {};

      switch (newType) {
        case EnvironmentVariableType.Boolean:
          currentValue.syncValue = Boolean(previousValue.syncValue);
          currentValue.localValue = Boolean(previousValue.localValue);
          break;
        case EnvironmentVariableType.Number:
          switch (prevType) {
            case EnvironmentVariableType.Secret:
            case EnvironmentVariableType.String:
              currentValue.syncValue = isNaN(previousValue.syncValue) ? 0 : Number(previousValue.syncValue);
              currentValue.localValue = isNaN(previousValue.localValue) ? 0 : Number(previousValue.localValue);
              break;
            default:
              currentValue.syncValue = isNaN(currentValue.syncValue) ? 0 : Number(currentValue.syncValue);
              currentValue.localValue = isNaN(currentValue.localValue) ? 0 : Number(currentValue.localValue);
              break;
          }
          break;
        case EnvironmentVariableType.String:
          switch (prevType) {
            case EnvironmentVariableType.Secret:
              currentValue.syncValue = String(previousValue.syncValue);
              currentValue.localValue = String(previousValue.localValue);
              break;
          }

          break;
        case EnvironmentVariableType.Secret:
          currentValue.syncValue = String(previousValue.syncValue);
          currentValue.localValue = String(previousValue.localValue);
          break;
        default:
          break;
      }

      handleVariableChange({ ...record, type: newType, ...currentValue }, "type");
    },
    [record, handleVariableChange, previousValues]
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

  useEffect(() => {
    if (!isEmpty(record)) {
      setPreviousValues((prev) => ({
        ...prev,
        [record.type]: { syncValue: record.syncValue, localValue: record.localValue },
      }));
    }
  }, [record]);

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

import { Form, FormInstance, Input, InputNumber, Select } from "antd";
import React, { useCallback, useContext, useMemo, useRef, useEffect } from "react";
import { EnvironmentVariableTableRow } from "../../VariablesList";
import { EnvironmentVariableType } from "backend/environment/types";
import debounce from "lodash/debounce";
import Logger from "lib/logger";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof EnvironmentVariableTableRow;
  record: EnvironmentVariableTableRow;
  handleSaveVariable: (record: EnvironmentVariableTableRow, fieldChanged: keyof EnvironmentVariableTableRow) => void;
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
  options,
  ...restProps
}) => {
  const location = useLocation();
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

  const handleSaveCellValue = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const updatedRecord = { ...record, ...values };

      updatedRecord.syncValue = convertValueByType(updatedRecord.syncValue, updatedRecord.type);
      updatedRecord.localValue = convertValueByType(updatedRecord.localValue, updatedRecord.type);

      handleSaveVariable(updatedRecord, dataIndex);
    } catch (errInfo) {
      Logger.log("Save failed:", errInfo);
    }
  }, [form, record, handleSaveVariable, convertValueByType, dataIndex]);

  const debouncedSave = useMemo(() => debounce(handleSaveCellValue, 1000), [handleSaveCellValue]);

  const handleChange = useCallback(
    (value: string | number | boolean) => {
      form.setFieldsValue({ [dataIndex]: value });
      if (dataIndex === "type") {
        handleSaveVariable({ ...record, [dataIndex]: value, syncValue: "", localValue: "" }, dataIndex);
        form.setFieldsValue({ syncValue: "", localValue: "" });
      } else {
        debouncedSave();
      }
    },
    [form, dataIndex, debouncedSave, handleSaveVariable, record]
  );

  useEffect(() => {
    // automatically focus on the "key" input for newest row
    // don't focus on key input for table in /new route
    if (
      dataIndex === "key" &&
      record?.key === "" &&
      inputRef.current &&
      !location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE)
    ) {
      inputRef.current.focus();
    }
  }, [dataIndex, record?.key, location.pathname]);

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
          <Select onChange={handleChange} value={record[dataIndex]} placeholder="Select value">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        );
    }
  }, [record, handleChange, dataIndex, getPlaceholderText]);

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
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {dataIndex === "type" ? (
          <Select
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
            ref={inputRef}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={getPlaceholderText(dataIndex)}
          />
        ) : (
          renderValueInputByType()
        )}
      </Form.Item>
    </td>
  );
};

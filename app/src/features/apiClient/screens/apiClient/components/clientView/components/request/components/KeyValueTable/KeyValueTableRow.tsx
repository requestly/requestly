import React, { useContext } from "react";
import { Checkbox, Form, FormInstance, Select, Input } from "antd";
import { KeyValuePair } from "features/apiClient/types";
import { EnvironmentVariables } from "backend/environment/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { FormDropDownOptions } from "features/apiClient/types";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof KeyValuePair;
  record: KeyValuePair;
  variables: EnvironmentVariables;
  handleUpdatePair: (record: KeyValuePair) => void;
  isMultipartForm?: boolean;
}

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  variables,
  handleUpdatePair,
  isMultipartForm,
  ...restProps
}) => {
  const form = useContext(EditableContext);

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleUpdatePair({ ...record, ...values });
    } catch (error) {
      console.error("Error saving key-value pair", error);
    }
  };

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  return (
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {dataIndex === "isEnabled" ? (
          <Checkbox
            className="key-value-table-checkbox"
            checked={record?.isEnabled ?? true}
            onChange={(e) => {
              form.setFieldsValue({ [dataIndex]: e.target.checked });
              save();
            }}
          />
        ) : (
          <>
            <div className="key-value-table-input-container">
              {(dataIndex === "key" || (dataIndex === "value" && record?.type !== FormDropDownOptions.FILE)) && (
                <SingleLineEditor
                  className={`key-value-table-input ${
                    record.isEnabled === false ? "key-value-table-input-disabled" : ""
                  }`}
                  placeholder={dataIndex === "key" ? "Key" : "Value"}
                  defaultValue={record?.[dataIndex] as string}
                  onChange={(value) => {
                    form.setFieldsValue({ [dataIndex]: value });
                    save();
                  }}
                  variables={variables}
                />
              )}

              {dataIndex === "key" && isMultipartForm && (
                <Select
                  className="key-value-table-file-text-select"
                  options={[
                    { value: FormDropDownOptions.TEXT, label: "Text" },
                    { value: FormDropDownOptions.FILE, label: "File" },
                  ]}
                  defaultValue={record?.type || FormDropDownOptions.TEXT}
                  onChange={(value) => {
                    record.type = value;
                    save();
                  }}
                />
              )}

              {dataIndex === "value" && isMultipartForm && record?.type === FormDropDownOptions.FILE && (
                <Input
                  type="file"
                  className="key-value-table-file-input"
                  onChange={(e) => {
                    const file = e.target.value;
                    if (file) {
                      form.setFieldsValue({ [dataIndex]: file });
                      save();
                    }
                  }}
                />
              )}
            </div>
          </>
        )}
      </Form.Item>
    </td>
  );
};

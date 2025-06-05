import React, { useContext } from "react";
import { Checkbox, Form, FormInstance } from "antd";
import { KeyValuePair } from "features/apiClient/types";
import { EnvironmentVariables } from "backend/environment/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import InfoIcon from "components/misc/InfoIcon";

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
}

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  variables,
  handleUpdatePair,
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
          <div
            className={`key-value-input-container 
          ${record.key.includes(":") && dataIndex === "key" ? "error-state" : ""}
        `}
          >
            <SingleLineEditor
              className={`key-value-table-input ${record.isEnabled === false ? "key-value-table-input-disabled" : ""}`}
              placeholder={dataIndex === "key" ? "Key" : "Value"}
              defaultValue={record?.[dataIndex] as string}
              onChange={(value) => {
                form.setFieldsValue({ [dataIndex]: value });
                save();
              }}
              variables={variables}
            />
            {record.key.includes(":") && dataIndex === "key" && (
              <div className="key-value-table-error-icon">
                <InfoIcon
                  text="Invalid character used in key"
                  tooltipPlacement="right"
                  showArrow={false}
                  style={{
                    color: "var(--requestly-color-error)",
                    width: "12.25px",
                    height: "14px",
                    fontFamily: "Material Symbols Outlined",
                  }}
                ></InfoIcon>
              </div>
            )}
          </div>
        )}
      </Form.Item>
    </td>
  );
};

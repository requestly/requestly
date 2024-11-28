import React, { useContext } from "react";
import { Checkbox, Form, FormInstance } from "antd";
import { KeyValueFormType, KeyValuePair } from "features/apiClient/types";
import { trackEnableKeyValueToggled } from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";

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
  pairtype: KeyValueFormType;
  handleUpdatePair: (record: KeyValuePair) => void;
}

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  pairtype,
  handleUpdatePair,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  const { getCurrentEnvironmentVariables } = useEnvironmentManager();
  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleUpdatePair({ ...record, ...values });
    } catch (errInfo) {
      Logger.log(pairtype, " KeyValueTable: Save failed:", errInfo);
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
            checked={record?.isEnabled}
            onChange={(e) => {
              form.setFieldsValue({ [dataIndex]: e.target.checked });
              save();
              trackEnableKeyValueToggled(e.target.checked, pairtype);
            }}
          />
        ) : (
          <RQSingleLineEditor
            className={`key-value-table-input ${!record.isEnabled ? "key-value-table-input-disabled" : ""}`}
            placeholder={dataIndex === "key" ? "Key" : "Value"}
            defaultValue={record?.[dataIndex] as string}
            onChange={(value) => {
              form.setFieldsValue({ [dataIndex]: value });
              save();
            }}
            variables={currentEnvironmentVariables}
          />
        )}
      </Form.Item>
    </td>
  );
};

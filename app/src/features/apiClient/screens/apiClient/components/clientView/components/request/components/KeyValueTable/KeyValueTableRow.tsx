import React, { useContext, useRef } from "react";
import { Checkbox, Form, FormInstance, Input, InputRef } from "antd";
import { KeyValueFormType, KeyValuePair } from "features/apiClient/types";
import { trackEnableKeyValueToggled } from "modules/analytics/events/features/apiClient";
import Logger from "lib/logger";

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
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  // const toggleEdit = () => {
  //   form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  // };

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
              handleUpdatePair({ ...record, isEnabled: e.target.checked });
              trackEnableKeyValueToggled(e.target.checked, pairtype);
            }}
          />
        ) : (
          <Input
            className={`key-value-table-input ${!record.isEnabled ? "key-value-table-input-disabled" : ""}`}
            ref={inputRef}
            onBlur={save}
            onChange={save}
          />
        )}
      </Form.Item>
    </td>
  );
};

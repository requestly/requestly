import React, { useContext } from "react";
import { Form, FormInstance, Input } from "antd";
import { RQAPI } from "features/apiClient/types";
import { toast } from "utils/Toast";

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
  dataIndex: keyof RQAPI.PathVariable;
  record: RQAPI.PathVariable;
  handleUpdateVariable: (record: RQAPI.PathVariable) => void;
}

export const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleUpdateVariable,
  ...restProps
}) => {
  const form = useContext(EditableContext);

  const save = async () => {
    try {
      const values = await form.validateFields();
      handleUpdateVariable({ ...record, ...values });
    } catch (error) {
      toast.error("Something went wrong while saving path variables");
    }
  };

  if (!editable) {
    return (
      <td {...restProps}>
        <div className="path-variable-input-container">
          <Input
            className="path-variable-table-input path-variable-table-input-disabled"
            value={record?.[dataIndex] || ""}
            disabled
            readOnly
          />
        </div>
      </td>
    );
  }

  return (
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        <div className="path-variable-input-container">
          <Input
            className="path-variable-table-input"
            value={record?.[dataIndex]}
            onChange={(e) => {
              form.setFieldsValue({ [dataIndex]: e.target.value });
              save();
            }}
            placeholder={dataIndex === "value" ? "Value" : "Description"}
          />
        </div>
      </Form.Item>
    </td>
  );
};

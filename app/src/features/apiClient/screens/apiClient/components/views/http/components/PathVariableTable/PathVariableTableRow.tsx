import React, { useContext } from "react";
import { Form, FormInstance, Input } from "antd";
import { RQAPI } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import * as Sentry from "@sentry/react";

const EditableContext = React.createContext<FormInstance<RQAPI.PathVariable> | null>(null);

interface EditableRowProps {
  index: number;
}
/*
TODO: Create a base context and EditableRow component and use it in Editable table components
*/
export const PathVariableTableEditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
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
  environmentVariables: ScopedVariables;
  handleUpdateVariable: (record: RQAPI.PathVariable) => void;
}

export const PathVariableTableEditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  environmentVariables,
  handleUpdateVariable,
  ...restProps
}) => {
  const form = useContext(EditableContext);

  if (!form) {
    Sentry.captureException(new Error("EditableCell rendered outside Path variables context"));
    return <td {...restProps}>{children}</td>;
  }

  const handleChange = (value: string) => {
    form.setFieldsValue({ [dataIndex]: value });
    handleUpdateVariable({ ...record, [dataIndex]: value });
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
          {dataIndex === "value" ? (
            <SingleLineEditor
              className="path-variable-table-input"
              placeholder="Value"
              defaultValue={record?.[dataIndex]}
              onChange={handleChange}
              variables={environmentVariables}
            />
          ) : (
            <Input
              className="path-variable-table-input"
              value={record?.[dataIndex]}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={dataIndex === "key" ? "Key" : "Description"}
            />
          )}
        </div>
      </Form.Item>
    </td>
  );
};

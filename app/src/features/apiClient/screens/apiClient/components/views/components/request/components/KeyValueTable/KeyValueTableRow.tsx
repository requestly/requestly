import React, { useContext } from "react";
import { Checkbox, Form, FormInstance } from "antd";
import { KeyValueDataType, KeyValuePair } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import InfoIcon from "components/misc/InfoIcon";
import { Conditional } from "components/common/Conditional";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import KeyValueDescriptionCell from "./KeyValueTableDescriptionCell";
import { KeyValueTypeCell, ValidationWarning } from "./KeyValueTableTypeCell";
import { captureException } from "@sentry/react";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

export const KeyValueTableEditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
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
  variables: ScopedVariables;
  handleUpdatePair: (record: KeyValuePair) => void;
  checkInvalidCharacter: boolean;
  error?: string | null;
  tableType?: string;
}

export const KeyValueTableEditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  variables,
  handleUpdatePair,
  checkInvalidCharacter,
  error,
  tableType,
  ...restProps
}) => {
  const form = useContext(EditableContext);

  if (!form) {
    captureException(new Error("EditableCell rendered outside Key-Value table context"));
    return <td {...restProps}>{children}</td>;
  }

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

  const isDescription = dataIndex === "description";
  const isDataTypeField = dataIndex === "dataType";

  if (isDescription) {
    return (
      <td {...restProps}>
        <KeyValueDescriptionCell record={record} dataIndex={dataIndex} form={form} onSave={save} />
      </td>
    );
  }

  if (isDataTypeField) {
    return (
      <td {...restProps}>
        <KeyValueTypeCell
          record={record?.dataType ?? KeyValueDataType.STRING}
          dataIndex={dataIndex}
          form={form}
          onSave={save}
        />
      </td>
    );
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
          ${
            INVALID_KEY_CHARACTERS.test(record?.key) && dataIndex === "key" && checkInvalidCharacter
              ? "error-state"
              : ""
          }
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
              suggestions={tableType === "Headers" && dataIndex === "key" ? HEADER_SUGGESTIONS.Request : undefined}
            />

            <Conditional
              condition={INVALID_KEY_CHARACTERS.test(record?.key) && dataIndex === "key" && checkInvalidCharacter}
            >
              <div className="key-value-table-error-icon">
                <InfoIcon
                  text="Invalid character used in key"
                  tooltipPlacement="right"
                  showArrow={false}
                  style={{
                    color: "var(--requestly-color-error)",
                    marginTop: "2px",
                    width: "16px",
                    height: "16px",
                    fontFamily: "Material Symbols Outlined",
                  }}
                />
              </div>
            </Conditional>
            <Conditional condition={!!error && dataIndex === "value"}>
              <div className="key-value-table-error-icon">
                <ValidationWarning error={error!} />
              </div>
            </Conditional>
          </div>
        )}
      </Form.Item>
    </td>
  );
};

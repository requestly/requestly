import React, { useContext } from "react";
import { Checkbox, Form, FormInstance, Tooltip, Input } from "antd";
import { KeyValuePair } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import InfoIcon from "components/misc/InfoIcon";
import { Conditional } from "components/common/Conditional";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

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
  ...restProps
}) => {
  const form = useContext(EditableContext);
  const [isFocused, setIsFocused] = React.useState(false);

  const save = async () => {
    try {
      const values = await form?.validateFields();
      handleUpdatePair({ ...record, ...values });
    } catch (error) {
      console.error("Error saving key-value pair", error);
    }
  };

  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }
  const isDescription = dataIndex === "description";

  return (
    <td {...restProps}>
      <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
        {dataIndex === "isEnabled" ? (
          <Checkbox
            className="key-value-table-checkbox"
            checked={record?.isEnabled ?? true}
            onChange={(e) => {
              form?.setFieldsValue({ [dataIndex]: e.target.checked });
              save();
            }}
          />
        ) : (
          <div
            className={`key-value-input-container ${isDescription ? "kv-description" : ""} ${
              isFocused ? "kv-description-focused" : ""
            }
${INVALID_KEY_CHARACTERS.test(record?.key) && dataIndex === "key" && checkInvalidCharacter ? "error-state" : ""}
              `}
            onFocus={!isDescription ? () => setIsFocused(true) : undefined}
            onBlur={!isDescription ? () => setIsFocused(false) : undefined}
          >
            {isDescription ? (
              <Tooltip title={!isFocused ? (record?.[dataIndex] as string) : undefined} placement="topLeft">
                <div className="description-wrapper">
                  {isFocused ? (
                    <Input.TextArea
                      className="key-value-table-input description-textarea"
                      autoSize={{ minRows: 3 }}
                      defaultValue={record?.[dataIndex] as string}
                      onChange={(e) => {
                        form?.setFieldsValue({ [dataIndex]: e.target.value });
                      }}
                      onBlur={(e) => {
                        setIsFocused(false);
                        save();
                      }}
                      autoFocus
                      spellCheck={false}
                    />
                  ) : (
                    <div className="description-readonly" onClick={() => setIsFocused(true)}>
                      {(record?.[dataIndex] as string) || <span style={{ opacity: 0.5 }}>Description</span>}
                    </div>
                  )}
                </div>
              </Tooltip>
            ) : (
              <>
                <SingleLineEditor
                  className={`key-value-table-input ${
                    record.isEnabled === false ? "key-value-table-input-disabled" : ""
                  }`}
                  placeholder={dataIndex === "key" ? "Key" : dataIndex === "value" ? "Value" : ""}
                  defaultValue={record?.[dataIndex] as string}
                  onChange={(value) => {
                    form?.setFieldsValue({ [dataIndex]: value });
                    save();
                  }}
                  variables={variables}
                />
              </>
            )}
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
          </div>
        )}
      </Form.Item>
    </td>
  );
};

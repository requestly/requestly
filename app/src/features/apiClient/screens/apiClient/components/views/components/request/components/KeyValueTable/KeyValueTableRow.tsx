import React, { useContext } from "react";
import { Checkbox, Form, FormInstance, AutoComplete, Input } from "antd";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
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

  const save = async () => {
    try {
      if (!form) return;
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
              if (!form) return;
              form.setFieldsValue({ [dataIndex]: e.target.checked });
              save();
            }}
          />
        ) : dataIndex === "key" ? (
          <AutoComplete
            options={HEADER_SUGGESTIONS.Request}
            filterOption={(input, option) => !!option?.value?.toLowerCase().includes(input.toLowerCase())}
            value={record?.key}
            onChange={(value) => {
              if (!form) return;
              form.setFieldsValue({ key: value });
              save();
            }}
          >
            <Input
              placeholder="Key"
              style={{
                border: "none",
                background: "transparent",
                boxShadow: "none",
              }}
            />
          </AutoComplete>
        ) : (
          <div
            className={`key-value-input-container
          ${INVALID_KEY_CHARACTERS.test(record?.key) && checkInvalidCharacter ? "error-state" : ""}
        `}
          >
            <SingleLineEditor
              className="key-value-table-input"
              placeholder="Value"
              defaultValue={record?.value}
              onChange={(value) => {
                if (!form) return;
                form.setFieldsValue({ value });
                save();
              }}
              variables={variables}
            />
            <Conditional condition={INVALID_KEY_CHARACTERS.test(record?.key) && checkInvalidCharacter}>
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

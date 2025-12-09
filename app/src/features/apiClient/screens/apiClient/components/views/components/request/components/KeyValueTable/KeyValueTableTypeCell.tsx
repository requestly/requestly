import React, { useCallback, useMemo } from "react";
import { Form, Dropdown, Menu, MenuProps, FormInstance } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { KeyValuePair, ValueType } from "features/apiClient/types";

const ALL_VALUE_TYPES: ValueType[] = Object.values(ValueType);

interface KeyValueTypeCellProps {
  record: KeyValuePair;
  dataIndex: keyof KeyValuePair;
  form: FormInstance;
  onSave: () => Promise<void>;
}

const KeyValueTypeCell: React.FC<KeyValueTypeCellProps> = ({ record, dataIndex, form, onSave }) => {
  const handleMenuClick: MenuProps["onClick"] = useCallback(
    ({ key }) => {
      const selectedValueType = key as ValueType;
      form.setFieldsValue({ [dataIndex]: selectedValueType });
      onSave();
    },
    [form, dataIndex, onSave]
  );

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      ALL_VALUE_TYPES.map((type) => ({
        key: type,
        label: type,
        className: "key-value-type-dropdown-item",
      })),
    []
  );

  const menu = <Menu items={menuItems} onClick={handleMenuClick} />;

  const currentValue = record?.[dataIndex] as string;

  return (
    <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={currentValue} validateTrigger={[]}>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
        <div className="key-value-type-view">
          <span className="key-value-type-text">
            {currentValue || <span className="placeholder">Select Type</span>}
          </span>
          <DownOutlined className="key-value-type-arrow" />
        </div>
      </Dropdown>
    </Form.Item>
  );
};

export default KeyValueTypeCell;

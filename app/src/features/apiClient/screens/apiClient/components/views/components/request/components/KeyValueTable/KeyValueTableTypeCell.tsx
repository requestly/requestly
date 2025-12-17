import React, { useCallback, useMemo } from "react";
import { Form, Dropdown, Menu, MenuProps, FormInstance, Tooltip } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { capitalize } from "lodash";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";

const ALL_VALUE_TYPES: KeyValueDataType[] = Object.values(KeyValueDataType);

interface KeyValueTypeCellProps {
  record: KeyValueDataType;
  dataIndex: keyof KeyValuePair;
  form: FormInstance;
  onSave: () => Promise<void>;
}

export const KeyValueTypeCell: React.FC<KeyValueTypeCellProps> = ({ record, dataIndex, form, onSave }) => {
  const handleMenuClick: MenuProps["onClick"] = useCallback(
    ({ key }) => {
      const selectedValueType = key as KeyValueDataType;
      form.setFieldsValue({ [dataIndex]: selectedValueType });
      onSave();
    },
    [form, dataIndex, onSave]
  );

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      ALL_VALUE_TYPES.map((type) => ({
        key: type,
        label: capitalize(type),
        className: "key-value-type-dropdown-item",
      })),
    []
  );

  const menu = <Menu items={menuItems} onClick={handleMenuClick} />;
  const rawValue = record ?? KeyValueDataType.STRING;

  return (
    <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={rawValue} validateTrigger={[]}>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
        <div className="key-value-type-view">
          <span className="key-value-type-text">{capitalize(String(rawValue))}</span>
          <DownOutlined className="key-value-type-arrow" />
        </div>
      </Dropdown>
    </Form.Item>
  );
};

export const ValidationWarning = ({ error }: { error: string }) => (
  <Tooltip title={error} color="#000">
    <span style={{ display: "flex", alignItems: "center" }}>
      <AiOutlineWarning style={{ color: "#E09400", fontSize: "16px" }} />
    </span>
  </Tooltip>
);

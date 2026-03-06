import React, { useState } from "react";
import { Modal, Table, Button } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { AiOutlineEye } from "@react-icons/all-files/ai/AiOutlineEye";
import { AiOutlineEyeInvisible } from "@react-icons/all-files/ai/AiOutlineEyeInvisible";
import "./index.scss";

export interface SecretKeyEntry {
  key: string;
  value: string;
}

interface SecretKeysModalProps {
  open: boolean;
  alias: string;
  keyValues: SecretKeyEntry[];
  onClose: () => void;
}

const SecretKeysModal: React.FC<SecretKeysModalProps> = ({ open, alias, keyValues, onClose }) => {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const columns: ColumnsType<SecretKeyEntry> = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: "45%",
      render: (text: string) => <span className="secret-keys-modal__cell-text">{text}</span>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (_: string, record: SecretKeyEntry) => {
        const isVisible = visibleKeys.has(record.key);
        return (
          <div className="secret-keys-modal__value-row">
            <span className="secret-keys-modal__dots">
              {isVisible ? record.value : "•".repeat(Math.min(record.value.length || 16, 16))}
            </span>
            <Button
              type="text"
              size="small"
              className="secret-keys-modal__visibility-btn"
              icon={isVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              onClick={() => toggleKey(record.key)}
            />
          </div>
        );
      },
    },
  ];

  const header = <div className="secret-keys-modal__header">{alias}</div>;

  return (
    <Modal
      open={open}
      title={header}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
      className="secret-keys-modal"
      wrapClassName="secret-keys-modal-wrap"
      zIndex={1050}
    >
      <p className="secret-keys-modal__type-label">Key/value secrets</p>
      <Table
        className="secret-keys-modal__table"
        columns={columns}
        dataSource={keyValues?.map((kv) => ({ ...kv, key: kv.key }))}
        pagination={false}
        size="small"
        bordered
        tableLayout="fixed"
      />
    </Modal>
  );
};

export default SecretKeysModal;

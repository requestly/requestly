import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React, { memo, useCallback, useEffect } from "react";
import { KeyValuePair } from "../../types";

interface Props {
  keyValuePairs: KeyValuePair[];
  setKeyValuePairs: (keyValuePairs: KeyValuePair[]) => void;
}

export const getEmptyPair = (): KeyValuePair => ({ id: Math.random(), key: "", value: "" });

const KeyValueForm: React.FC<Props> = ({ keyValuePairs, setKeyValuePairs }) => {
  const addEmptyPair = useCallback(() => {
    setKeyValuePairs([...keyValuePairs, getEmptyPair()]);
  }, [keyValuePairs, setKeyValuePairs]);

  useEffect(() => {
    if (!keyValuePairs?.length || keyValuePairs[keyValuePairs.length - 1].key) {
      addEmptyPair();
    }
  }, [keyValuePairs, addEmptyPair]);

  const onKeyChange = useCallback(
    (key: string, index: number) => {
      const newKeyValuePairs = [...keyValuePairs];
      newKeyValuePairs[index].key = key;
      setKeyValuePairs(newKeyValuePairs);
    },
    [keyValuePairs, setKeyValuePairs]
  );

  const onValueChange = useCallback(
    (value: string, index: number) => {
      const newKeyValuePairs = [...keyValuePairs];
      newKeyValuePairs[index].value = value;
      setKeyValuePairs(newKeyValuePairs);
    },
    [keyValuePairs, setKeyValuePairs]
  );

  const onDeleteClicked = useCallback(
    (index: number) => {
      const newKeyValuePairs = [...keyValuePairs];
      newKeyValuePairs.splice(index, 1);
      setKeyValuePairs(newKeyValuePairs);
    },
    [keyValuePairs, setKeyValuePairs]
  );

  return (
    <table className="key-value-pairs-table">
      <tbody>
        {keyValuePairs.map((param, index) => (
          <tr key={param.id}>
            <td className="key">
              <Input placeholder="key" value={param.key} onChange={(evt) => onKeyChange(evt.target.value, index)} />
            </td>
            <td className="value">
              <Input
                placeholder="value"
                value={param.value}
                onChange={(evt) => onValueChange(evt.target.value, index)}
              />
            </td>
            <td>
              <Button type="text" icon={<DeleteOutlined />} onClick={() => onDeleteClicked(index)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default memo(KeyValueForm);

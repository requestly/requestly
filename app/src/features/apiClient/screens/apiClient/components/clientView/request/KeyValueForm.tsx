import { DeleteOutlined } from "@ant-design/icons";
import { AutoComplete, Button } from "antd";
import React, { memo, useCallback, useEffect } from "react";
import { KeyValuePair } from "../../../../../types";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";

interface Props {
  keyValuePairs: KeyValuePair[];
  setKeyValuePairs: (keyValuePairs: KeyValuePair[]) => void;
  keyOptions?: { value: string }[];
}

export const getEmptyPair = (): KeyValuePair => ({ id: Math.random(), key: "", value: "" });

const KeyValueForm: React.FC<Props> = ({ keyValuePairs, setKeyValuePairs, keyOptions }) => {
  const { getCurrentEnvironmentVariables } = useEnvironmentManager();
  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

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
        {keyValuePairs?.map((param, index) => (
          <tr key={param.id}>
            <td className="key">
              {keyOptions ? (
                <AutoComplete
                  options={keyOptions}
                  value={param.key}
                  onChange={(val) => onKeyChange(val, index)}
                  filterOption={(inputValue, option: any) => {
                    if (option.value) {
                      return option.value.toLowerCase().includes(inputValue.toLowerCase());
                    }
                  }}
                  placeholder="key"
                />
              ) : (
                // <Input placeholder="key" value={param.key} onChange={(evt) => onKeyChange(evt.target.value, index)} />
                <RQSingleLineEditor
                  placeholder="key"
                  defaultValue={param.key}
                  onChange={(val) => onKeyChange(val, index)}
                  variables={currentEnvironmentVariables}
                />
              )}
            </td>
            <td className="value">
              {/* <Input
                placeholder="value"
                value={param.value}
                onChange={(evt) => onValueChange(evt.target.value, index)}
              /> */}
              <RQSingleLineEditor
                placeholder="value"
                defaultValue={param.value}
                onChange={(value) => onValueChange(value, index)}
                variables={currentEnvironmentVariables}
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

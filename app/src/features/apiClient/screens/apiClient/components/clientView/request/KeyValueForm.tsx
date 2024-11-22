import { DeleteOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Checkbox } from "antd";
import React, { memo, useCallback, useEffect } from "react";
import { KeyValueFormType, KeyValuePair } from "../../../../../types";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { trackEnableKeyValueToggled } from "modules/analytics/events/features/apiClient";

interface Props {
  keyValuePairs: KeyValuePair[];
  setKeyValuePairs: (keyValuePairs: KeyValuePair[]) => void;
  keyOptions?: { value: string }[];
  formType: KeyValueFormType;
}

export const getEmptyPair = (): KeyValuePair => ({ id: Math.random(), key: "", value: "", isEnabled: true });

const KeyValueForm: React.FC<Props> = ({ keyValuePairs, setKeyValuePairs, keyOptions, formType }) => {
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

  const onEnableKeyChange = useCallback(
    (isEnabled: boolean, index: number) => {
      const newKeyValuePairs = [...keyValuePairs];
      newKeyValuePairs[index].isEnabled = isEnabled;
      setKeyValuePairs(newKeyValuePairs);
    },
    [keyValuePairs, setKeyValuePairs]
  );

  return (
    <table className="key-value-pairs-table">
      <tbody>
        {keyValuePairs?.map((param, index) => (
          <tr key={param.id}>
            <td>
              {param.key.length ? (
                <Checkbox
                  checked={param.isEnabled || param.isEnabled === undefined}
                  onChange={(evt) => {
                    onEnableKeyChange(evt.target.checked, index);
                    trackEnableKeyValueToggled(evt.target.checked, formType);
                  }}
                />
              ) : null}
            </td>
            <td className={`key ${param.isEnabled === false ? "disabled-pair" : ""}`}>
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
                  key={index}
                  placeholder="key"
                  defaultValue={param.key}
                  onChange={(val) => onKeyChange(val, index)}
                  variables={currentEnvironmentVariables}
                />
              )}
            </td>
            <td className={`value ${param.isEnabled === false ? "disabled-pair" : ""}`}>
              {/* <Input
                placeholder="value"
                value={param.value}
                onChange={(evt) => onValueChange(evt.target.value, index)}
              /> */}
              <RQSingleLineEditor
                key={index}
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

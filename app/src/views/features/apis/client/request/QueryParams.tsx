import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React, { memo, useCallback, useEffect } from "react";
import { RQAPI } from "../../types";

interface Props {
  queryParams: RQAPI.QueryParam[];
  setQueryParams: (params: RQAPI.QueryParam[]) => void;
}

const getEmptyParam = (): RQAPI.QueryParam => ({ id: Math.random(), key: "", value: "" });

const QueryParams: React.FC<Props> = ({ queryParams, setQueryParams }) => {
  const addEmptyParam = useCallback(() => {
    setQueryParams([...queryParams, getEmptyParam()]);
  }, [queryParams, setQueryParams]);

  useEffect(() => {
    if (!queryParams?.length || queryParams[queryParams.length - 1].key) {
      addEmptyParam();
    }
  }, [queryParams, addEmptyParam]);

  const onKeyChange = useCallback(
    (key: string, index: number) => {
      const newParams = [...queryParams];
      newParams[index].key = key;
      setQueryParams(newParams);
    },
    [queryParams, setQueryParams]
  );

  const onValueChange = useCallback(
    (value: string, index: number) => {
      const newParams = [...queryParams];
      newParams[index].value = value;
      setQueryParams(newParams);
    },
    [queryParams, setQueryParams]
  );

  const onDeleteClicked = useCallback(
    (index: number) => {
      const newParams = [...queryParams];
      newParams.splice(index, 1);
      setQueryParams(newParams);
    },
    [queryParams, setQueryParams]
  );

  return (
    <table className="query-params-table">
      <tbody>
        {queryParams.map((param, index) => (
          <tr key={param.id}>
            <td className="key">
              <Input
                placeholder="param key"
                value={param.key}
                onChange={(evt) => onKeyChange(evt.target.value, index)}
              />
            </td>
            <td className="value">
              <Input
                placeholder="param value"
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

export default memo(QueryParams);

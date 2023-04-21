import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React, { memo, useCallback, useEffect } from "react";
import { RQAPI } from "../types";

interface Props {
  headers: RQAPI.Header[];
  setRequestHeaders: (headers: RQAPI.Header[]) => void;
}

const getEmptyHeader = (): RQAPI.Header => ({ id: Math.random(), name: "", value: "" });

const RequestHeaders: React.FC<Props> = ({ headers, setRequestHeaders }) => {
  const addEmptyHeader = useCallback(() => {
    setRequestHeaders([...headers, getEmptyHeader()]);
  }, [headers, setRequestHeaders]);

  useEffect(() => {
    if (!headers?.length || headers[headers.length - 1].name) {
      addEmptyHeader();
    }
  }, [headers, addEmptyHeader]);

  const onNameChange = useCallback(
    (name: string, index: number) => {
      const newHeaders = [...headers];
      newHeaders[index].name = name;
      setRequestHeaders(newHeaders);
    },
    [headers, setRequestHeaders]
  );

  const onValueChange = useCallback(
    (value: string, index: number) => {
      const newHeaders = [...headers];
      newHeaders[index].value = value;
      setRequestHeaders(newHeaders);
    },
    [headers, setRequestHeaders]
  );

  const onDeleteClicked = useCallback(
    (index: number) => {
      const newHeaders = [...headers];
      newHeaders.splice(index, 1);
      setRequestHeaders(newHeaders);
    },
    [headers, setRequestHeaders]
  );

  return (
    <table className="request-headers-table">
      <tbody>
        {headers.map((header, index) => (
          <tr key={header.id}>
            <td className="name">
              <Input
                placeholder="header name"
                value={header.name}
                onChange={(evt) => onNameChange(evt.target.value, index)}
              />
            </td>
            <td className="value">
              <Input
                placeholder="header value"
                value={header.value}
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

export default memo(RequestHeaders);

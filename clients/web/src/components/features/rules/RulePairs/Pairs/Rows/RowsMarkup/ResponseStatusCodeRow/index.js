import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Select, AutoComplete } from "antd";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { statusCodes } from "config/constants/sub/statusCode";
import "./ResponseStatusCodeRow.css";

const { Option, OptGroup } = Select;

const ResponseStatusCodeRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();
  const [statusCode, setStatusCode] = useState(pair.response.statusCode);

  return (
    <Row key={rowIndex} className="w-full">
      <Col span={24} className="response-status-code-container" data-tour-id="rule-editor-response-status-code">
        <label className="subtitle response-status-code-label">Response Status Code</label>
        <AutoComplete
          showSearch={true}
          size="large"
          className="response-status-code-select"
          placeholder="Returns original code if left empty"
          disabled={isInputDisabled}
          value={statusCode || undefined}
          dropdownMatchSelectWidth={false}
          onChange={(value) => {
            dispatch(
              globalActions.updateRulePairAtGivenPath({
                pairIndex,
                updates: {
                  "response.statusCode": value,
                  "response.statusText": statusCodes[value] || "",
                },
              })
            );

            setStatusCode(value);
          }}
          filterOption={(inputValue, option) => {
            // exclude category headings
            if (option.value) {
              return option.children?.toLowerCase()?.includes(inputValue.toLowerCase());
            }
          }}
        >
          {APP_CONSTANTS?.STATUS_CODE?.map(({ label, options }) => (
            <OptGroup label={label} key={label}>
              {options.map(({ id, label, value }) => (
                <Option value={value} key={id}>
                  {label}
                </Option>
              ))}
            </OptGroup>
          ))}
        </AutoComplete>
      </Col>
    </Row>
  );
};

export default ResponseStatusCodeRow;

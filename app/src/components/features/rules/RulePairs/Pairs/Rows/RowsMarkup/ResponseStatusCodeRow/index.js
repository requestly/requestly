import React, { useState } from "react";
import { Row, Col, Select, AutoComplete } from "antd";
import APP_CONSTANTS from "config/constants";
import { statusCodes } from "config/constants/sub/statusCode";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import "./ResponseStatusCodeRow.css";

const { Option, OptGroup } = Select;

const ResponseStatusCodeRow = ({ rowIndex, pair, pairIndex, helperFunctions, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;
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
            modifyPairAtGivenPath(null, pairIndex, "response.statusCode", value, [
              {
                path: "response.statusText",
                value: statusCodes[value] || "",
              },
            ]);
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
        <span className="response-status-code-select-icon">
          <DownArrow />
        </span>
      </Col>
    </Row>
  );
};

export default ResponseStatusCodeRow;

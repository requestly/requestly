import React, { useState } from "react";
import { Row, Col, Select, AutoComplete } from "antd";
import InfoIcon from "components/misc/InfoIcon";
import APP_CONSTANTS from "config/constants";
import { statusCodes } from "config/constants/sub/statusCode";

const { Option, OptGroup } = Select;

const ResponseStatusCodeRow = ({
  rowIndex,
  pair,
  pairIndex,
  helperFunctions,
  isInputDisabled,
}) => {
  const { modifyPairAtGivenPath } = helperFunctions;
  const [statusCode, setStatusCode] = useState(pair.response.statusCode);

  return (
    <React.Fragment key={rowIndex}>
      <Row key={rowIndex} span={24} align="middle" className="margin-top-one">
        <Col span={5} align="left">
          <span className="max-content">Response Status Code</span>
        </Col>
        <Col span={12} align="left">
          <AutoComplete
            showSearch={true}
            size="large"
            style={{ width: "100%" }}
            placeholder="Enter or select a status code"
            disabled={isInputDisabled}
            value={statusCode || undefined}
            dropdownMatchSelectWidth={false}
            onChange={(value) => {
              modifyPairAtGivenPath(
                null,
                pairIndex,
                "response.statusCode",
                value,
                [
                  {
                    path: "response.statusText",
                    value: statusCodes[value] || "",
                  },
                ]
              );
              setStatusCode(value);
            }}
            filterOption={(inputValue, option) => {
              // exclude category headings
              if (option.value) {
                return option.children
                  ?.toLowerCase()
                  ?.includes(inputValue.toLowerCase());
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
        <Col span={1} align="middle">
          <InfoIcon
            tooltipPlacement="right"
            text="Returns original code if left empty"
          />
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ResponseStatusCodeRow;

import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Col, Input, Row } from "antd";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
import { ValidationErrors } from "../../types";
import { useMediaQuery } from "react-responsive";

interface HeaderSectionProps {
  mappedHeader: {
    name: string;
    value: string;
    index: number;
  }[];
  errors: {
    headers: { indexError: number; valueError: string }[];
  };
  updateHeaders: (value: string, index: number, type: string) => void;
  removeHeader: (index: number) => void;
  addHeader: () => void;
}

export default function HeaderSection({
  mappedHeader,
  errors,
  updateHeaders,
  removeHeader,
  addHeader,
}: HeaderSectionProps) {
  const [filteredOptions, setFilteredOptions] = useState(HEADER_SUGGESTIONS.Response);
  const isSmallScreen = !useMediaQuery({ query: "(max-width: 768px)" });

  const renderHeaderErrors = (errors: ValidationErrors, index: number, errorType: string) => {
    if (errors.headers && errors.headers.some((err) => err.indexError === index)) {
      return (
        <div key={index}>
          {errors.headers
            .filter((err) => err.indexError === index)
            .map((headerError, errorIndex) => {
              if (headerError.valueError.startsWith(errorType)) {
                const boxPosError = headerError.valueError.slice(errorType.length).trim();
                return <div key={errorIndex}>{boxPosError}</div>;
              }
              return null;
            })}
        </div>
      );
    }
    return null;
  };

  return (
    <Col span={24}>
      <div style={{ marginBottom: "16px" }}>
        <Button onClick={addHeader} className="add-header">
          <span style={{ marginRight: "8px", fontWeight: "bold" }}>+</span>
          {mappedHeader.length === 0 ? "Add Headers" : "Add Modification"}
        </Button>
        {mappedHeader.map((header, index) => (
          <Row key={header.index} gutter={20} style={{ marginBottom: "4px" }}>
            <Col span={10}>
              <AutoComplete
                popupClassName="scrollable-dropdown"
                options={filteredOptions}
                value={header.name}
                onChange={(value) => {
                  updateHeaders(value, index, "name");
                }}
                onSearch={(inputValue) => {
                  const lowerInputValue = inputValue.toLowerCase();
                  const filtered = HEADER_SUGGESTIONS.Response.filter((option) =>
                    option.value.toLowerCase().includes(lowerInputValue)
                  );
                  setFilteredOptions(filtered);
                }}
              >
                <Input
                  placeholder="Header Name"
                  addonBefore={!isSmallScreen ? null : "Request Header"}
                  status={
                    errors &&
                    errors.headers &&
                    errors.headers.some((err) => err.indexError === index && err.valueError.startsWith("name"))
                      ? "error"
                      : undefined
                  }
                />
              </AutoComplete>
              <span className="field-error-prompt">{renderHeaderErrors(errors, index, "name")}</span>
            </Col>
            <Col span={9}>
              <Input
                placeholder="Header Value"
                addonBefore={!isSmallScreen ? null : "Value"}
                value={header.value}
                onChange={(value) => updateHeaders(value.target.value, index, "value")}
                status={
                  errors &&
                  errors.headers &&
                  errors.headers.some((err) => err.indexError === index && err.valueError.startsWith("value"))
                    ? "error"
                    : undefined
                }
              />
              <span className="field-error-prompt">{renderHeaderErrors(errors, index, "value")}</span>
            </Col>

            <Col span={1}>
              <Button onClick={() => removeHeader(index)} icon={<DeleteOutlined />} />
            </Col>
          </Row>
        ))}
      </div>
    </Col>
  );
}

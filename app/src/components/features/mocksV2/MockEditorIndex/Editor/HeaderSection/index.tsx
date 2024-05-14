import { useCallback, useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Col, Input, Row } from "antd";
import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
import { useMediaQuery } from "react-responsive";
import "../index.css";
interface HeaderError {
  errorIndex: number;
  typeOfError: "name" | "value";
  description?: string;
}
interface ValidationErrors {
  headers: HeaderError[];
}
interface HeaderSectionProps {
  mappedHeader: {
    name: string;
    value: string;
    index: number;
  }[];
  errors: ValidationErrors;
  setMappedHeader: (headers: { name: string; value: string; index: number }[]) => void;
  setHeadersString: (headersString: string) => void;
}
export default function HeaderSection({ mappedHeader, errors, setMappedHeader, setHeadersString }: HeaderSectionProps) {
  const [localErrors, setLocalErrors] = useState<ValidationErrors>(errors);
  const [filteredOptions, setFilteredOptions] = useState(HEADER_SUGGESTIONS.Response);
  const isSmallScreen = !useMediaQuery({ query: "(max-width: 768px)" });

  const addHeader = () => {
    const newHeader = { name: "", value: "", index: mappedHeader.length };
    setMappedHeader([...mappedHeader, newHeader]);
  };

  const removeHeader = useCallback(
    (index: number) => {
      const updatedHeaders = mappedHeader.filter((_, i) => i !== index);
      setMappedHeader(updatedHeaders);
      setHeadersString(JSON.stringify(updatedHeaders));
      const updatedErrors = localErrors.headers.filter((error) => error.errorIndex !== index);
      const reIndexedErrors = updatedErrors.map((error) => {
        if (error.errorIndex > index) {
          return { ...error, errorIndex: error.errorIndex - 1 };
        }
        return error;
      });
      setLocalErrors({ headers: reIndexedErrors });
    },
    [mappedHeader, localErrors, setMappedHeader, setHeadersString]
  );

  const updateHeaders = useCallback(
    (value: string, index: number, type: "name" | "value") => {
      let updatedHeaders = [...mappedHeader];
      updatedHeaders = updatedHeaders.map((header, i) => {
        if (i === index) {
          return { ...header, [type]: value };
        }
        return header;
      });
      // Checks if the updated header is the last one and if it has some value
      if (index === mappedHeader.length - 1 && (updatedHeaders[index].name || updatedHeaders[index].value)) {
        updatedHeaders.push({ name: "", value: "", index: updatedHeaders.length });
      }
      setMappedHeader(updatedHeaders);
      setHeadersString(JSON.stringify(updatedHeaders));
    },
    [mappedHeader, setMappedHeader, setHeadersString]
  );

  const renderHeaderErrors = (index: number, typeOfError: "name" | "value") => {
    if (!localErrors.headers) return null;
    return localErrors.headers
      .filter((err) => err.errorIndex === index && err.typeOfError === typeOfError)
      .map((err, errorIndex) => (
        <div key={errorIndex} className="field-error-prompt">
          {err.description}
        </div>
      ));
  };
  useEffect(() => {
    setLocalErrors(errors);
  }, [errors]);
  console.log("errors : ", errors.headers);
  return (
    <Col span={24}>
      <div className="header-section">
        <Button onClick={addHeader} className="add-header">
          <span className="add-header-span">+</span>
          {mappedHeader.length === 0 ? "Add Headers" : "Add Modification"}
        </Button>
        {mappedHeader.map((header, index) => (
          <Row key={header.index} gutter={20} className="header-row">
            <Col span={10}>
              <AutoComplete
                popupClassName="scrollable-dropdown"
                options={filteredOptions}
                value={header.name}
                onChange={(value) => updateHeaders(value, index, "name")}
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
                    localErrors.headers &&
                    localErrors.headers.some((err) => err.errorIndex === index && err.typeOfError === "name")
                      ? "error"
                      : undefined
                  }
                  onChange={(e) => updateHeaders(e.target.value, index, "name")}
                />
              </AutoComplete>
              {renderHeaderErrors(index, "name")}
            </Col>
            <Col span={9}>
              <Input
                placeholder="Header Value"
                addonBefore={!isSmallScreen ? null : "Value"}
                value={header.value}
                onChange={(e) => updateHeaders(e.target.value, index, "value")}
                status={
                  localErrors.headers &&
                  localErrors.headers.some((err) => err.errorIndex === index && err.typeOfError === "value")
                    ? "error"
                    : undefined
                }
              />
              {renderHeaderErrors(index, "value")}
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

// Default props
HeaderSection.defaultProps = {
  errors: { headers: [] },
};

import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Input, Row, Select, Switch, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { SourceKey, SourceOperator } from "types";
import { PageSource } from "../../types";
import "./pageSourceRow.css";

interface Props {
  isEditMode: boolean;
  disabled: boolean;
  source: PageSource;
  setEditPageSourceId: (id: string) => void;
  handleSavePageSourceDetails: (source: PageSource) => void;
  handlePageSourceStatusToggle: (id: string, status: boolean) => void;
  handleDeletePageSource: (id: string) => void;
}

export const PageSourceRow: React.FC<Props> = ({
  source,
  isEditMode,
  disabled,
  setEditPageSourceId,
  handleSavePageSourceDetails,
  handlePageSourceStatusToggle,
  handleDeletePageSource,
}) => {
  const [pageSourceDetails, setPageSourceDetails] = useState<PageSource>({
    value: "",
    isActive: false,
    key: SourceKey.URL,
    operator: SourceOperator.CONTAINS,
  });

  useEffect(() => {
    if (!isEditMode) return;

    setPageSourceDetails(source);
  }, [isEditMode, source]);

  const handlePageSourceDetailsChange = useCallback((key: keyof PageSource, value: PageSource[keyof PageSource]) => {
    setPageSourceDetails((prevSource) => ({ ...prevSource, [key]: value }));
  }, []);

  return !isEditMode ? (
    <Row align="middle" justify="space-between" className="page-source-row">
      <Col>
        <span className="source-label">{source.value}</span>
      </Col>
      <Col className="ml-auto">
        <Row wrap={false} align="middle" className="action-btns-container">
          <div className="page-source-switch">
            <span className="label">{source.isActive ? "Enabled" : "Disabled"}</span>
            <Switch
              size="small"
              disabled={disabled}
              checked={source.isActive}
              onChange={(status) => handlePageSourceStatusToggle(source.id, status)}
            />
          </div>
          <Tooltip title="Edit" mouseEnterDelay={1}>
            <RQButton
              iconOnly
              disabled={disabled}
              icon={<EditOutlined />}
              onClick={() => setEditPageSourceId(source.id)}
            />
          </Tooltip>
          <Tooltip title="Delete" mouseEnterDelay={1}>
            <RQButton
              iconOnly
              disabled={disabled}
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePageSource(source.id)}
            />
          </Tooltip>
        </Row>
      </Col>
    </Row>
  ) : (
    <div>
      <Select
        disabled={disabled}
        value={pageSourceDetails.key}
        size="small"
        className="recording-config"
        onChange={(value) => handlePageSourceDetailsChange("key", value)}
      >
        {Object.entries(SourceKey).map(([key, value]) => (
          <Select.Option key={value} value={value}>
            {key}
          </Select.Option>
        ))}
      </Select>

      <Select
        disabled={disabled}
        value={pageSourceDetails.operator}
        size="small"
        onChange={(value) => handlePageSourceDetailsChange("operator", value)}
      >
        {Object.entries(SourceOperator).map(([key, value]) => (
          <Select.Option key={key} value={value}>
            {key}
          </Select.Option>
        ))}
      </Select>

      <Input
        type="text"
        disabled={disabled}
        value={pageSourceDetails.value}
        onChange={(e) => handlePageSourceDetailsChange("value", e.target.value)}
        placeholder="Enter url here or leave this field empty to apply rule to all url's..."
        className=""
      />

      <Button disabled={disabled} type="primary" onClick={() => handleSavePageSourceDetails(pageSourceDetails)}>
        Save
      </Button>
    </div>
  );
};

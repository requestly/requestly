import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Input, Row, Select, Switch, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { capitalize } from "lodash";
import { SourceKey, SourceOperator } from "types";
import { PageSource } from "../../types";
import { toast } from "utils/Toast";
import "./pageSourceRow.css";

interface Props {
  disabled: boolean;
  source: PageSource;
  openInCreateMode?: boolean;
  handleDeletePageSource: (id: string) => void;
  handlePageSourceStatusToggle: (id: string, status: boolean) => void;
  handleSavePageSourceDetails: (source: PageSource, isCreateMode: boolean) => void;
}

export const PageSourceRow: React.FC<Props> = React.memo(
  ({
    source,
    disabled,
    openInCreateMode,
    handleSavePageSourceDetails,
    handlePageSourceStatusToggle,
    handleDeletePageSource,
  }) => {
    const [isEditMode, setIsEditMode] = useState(false);
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

    const handleSaveClick = useCallback(
      (e: unknown) => {
        if (pageSourceDetails.value.length === 0) {
          toast.warn("Please provide page source value!");
          return;
        }

        handleSavePageSourceDetails(pageSourceDetails, openInCreateMode);
        setIsEditMode(false);
      },
      [pageSourceDetails, openInCreateMode, handleSavePageSourceDetails]
    );

    return !isEditMode && !openInCreateMode ? (
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
              <RQButton iconOnly disabled={disabled} icon={<EditOutlined />} onClick={() => setIsEditMode(true)} />
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
      <Row align="middle" wrap={false} className="page-source-input-container">
        <Select
          disabled={disabled}
          value={pageSourceDetails.key}
          className="page-source-key-select"
          onChange={(value) => handlePageSourceDetailsChange("key", value)}
        >
          {Object.entries(SourceKey).map(([key, value]) => (
            <Select.Option key={value} value={value}>
              {capitalize(value)}
            </Select.Option>
          ))}
        </Select>

        <Select
          disabled={disabled}
          value={pageSourceDetails.operator}
          className="page-source-operator-select"
          onChange={(value) => handlePageSourceDetailsChange("operator", value)}
        >
          {Object.entries(SourceOperator).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {capitalize(
                value === SourceOperator.WILDCARD_MATCHES
                  ? "Wildcard"
                  : value === SourceOperator.MATCHES
                  ? "RegEx"
                  : value
              )}
            </Select.Option>
          ))}
        </Select>

        <Input
          type="text"
          disabled={disabled}
          className="page-source-input"
          value={pageSourceDetails.value}
          onChange={(e) => handlePageSourceDetailsChange("value", e.target.value)}
          placeholder="Enter url here or leave this field empty to apply rule to all url's..."
        />

        <Button type="primary" disabled={disabled} className="save-btn" onClick={handleSaveClick}>
          Save
        </Button>
      </Row>
    );
  }
);

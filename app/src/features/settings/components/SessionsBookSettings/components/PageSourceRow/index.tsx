import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row, Switch, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { SessionRecordingPageSource } from "types";
import { toast } from "utils/Toast";
import { SourceConditionInput } from "components/common/SourceUrl";
import "./pageSourceRow.css";
import { RuleSourceKey, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

interface Props {
  disabled: boolean;
  source: SessionRecordingPageSource;
  openInCreateMode?: boolean;
  handleDeletePageSource: (id: string) => void;
  handlePageSourceStatusToggle: (id: string, status: boolean) => void;
  handleSavePageSourceDetails: (source: SessionRecordingPageSource, isCreateMode: boolean) => void;
  getPageSourceLabel: (source: SessionRecordingPageSource) => string;
}

export const PageSourceRow: React.FC<Props> = React.memo(
  ({
    source,
    disabled,
    openInCreateMode,
    handleSavePageSourceDetails,
    handlePageSourceStatusToggle,
    handleDeletePageSource,
    getPageSourceLabel,
  }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [pageSourceDetails, setPageSourceDetails] = useState<SessionRecordingPageSource>({
      value: "",
      isActive: true,
      key: RuleSourceKey.URL,
      operator: RuleSourceOperator.CONTAINS,
    });

    useEffect(() => {
      if (!isEditMode) return;

      setPageSourceDetails(source);
    }, [isEditMode, source]);

    const handlePageSourceDetailsChange = useCallback((updatedSource: SessionRecordingPageSource) => {
      setPageSourceDetails((prevSource) => ({ ...prevSource, ...updatedSource }));
    }, []);

    const handleSaveClick = useCallback(
      (pageSourceDetails: SessionRecordingPageSource) => {
        if (pageSourceDetails.value.length === 0) {
          toast.warn("Please provide page source value!");
          return;
        }

        handleSavePageSourceDetails(pageSourceDetails, openInCreateMode);
        setIsEditMode(false);
      },
      [openInCreateMode, handleSavePageSourceDetails]
    );

    return !isEditMode && !openInCreateMode ? (
      <Row align="middle" justify="space-between" wrap={false} className="page-source-row">
        <Col
          className="source-label"
          style={{ color: disabled ? "var(--text-gray)" : "var(--requestly-color-text-default)" }}
        >
          {getPageSourceLabel(source)}
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
      <>
        <SourceConditionInput
          disabled={disabled}
          autoFocus={true}
          source={pageSourceDetails}
          onSourceChange={(updatedSource) => handlePageSourceDetailsChange(updatedSource as SessionRecordingPageSource)}
          additionalActions={
            <Button
              type="primary"
              disabled={disabled}
              className="save-btn"
              onClick={() => handleSaveClick(pageSourceDetails)}
            >
              Save
            </Button>
          }
        />
      </>
    );
  }
);

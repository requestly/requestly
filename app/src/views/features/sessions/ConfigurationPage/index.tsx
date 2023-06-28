import React, { useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button, Col, Input, Radio, RadioChangeEvent, Row, Select, Space, Switch, Table } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { ConfigurationRadioItem } from "./ConfigurationRadioItem";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isEqual } from "lodash";
import { toast } from "utils/Toast";
import { SourceKey, SourceOperator } from "types";
import { AutoRecordingMode, SessionRecordingConfig } from "../types";
import "./configuration.css";

// @ts-ignore
const emptyPageSourceData = {
  value: "",
  key: SourceKey.URL,
  operator: SourceOperator.CONTAINS,
};

const allPagesSourceData = {
  value: "*",
  key: SourceKey.URL,
  operator: SourceOperator.WILDCARD_MATCHES,
};

type ParentContext<T = SessionRecordingConfig> = {
  config: T;
  handleSaveConfig: (config: T, showToast?: boolean) => void;
};

const ConfigurationPage: React.FC = () => {
  const { config, handleSaveConfig } = useOutletContext<ParentContext>();
  const { pageSources = [], autoRecording } = config;

  // console.log({ config: autoRecording?.mode });

  // migrate legacy configs
  useEffect(() => {
    if (config.autoRecording) return;

    console.log("running...", config);
    const autoRecordingConfig: SessionRecordingConfig["autoRecording"] = {
      isActive: false,
      mode: AutoRecordingMode.ALL_PAGES,
    };

    const pageSourcesLength = config?.pageSources?.length ?? 0;
    if (pageSourcesLength === 0) {
      autoRecordingConfig.isActive = false;
    } else if (pageSourcesLength > 1) {
      autoRecordingConfig.isActive = true;
      autoRecordingConfig.mode = AutoRecordingMode.CUSTOM;
    } else if (pageSourcesLength === 1 && isEqual(config.pageSources?.[0], allPagesSourceData)) {
      autoRecordingConfig.isActive = true;
      autoRecordingConfig.mode = AutoRecordingMode.ALL_PAGES;
    }

    handleSaveConfig(
      {
        ...config,
        maxDuration: 5,
        pageSources: config?.pageSources ?? [],
        autoRecording: autoRecordingConfig,
      },
      false
    );
  }, [config, handleSaveConfig]);

  // this function will be modified after UI is done
  const setPageSourceValue = useCallback(
    (index: number, key: string, value: string) => {
      const updatedPageSources = config?.pageSources?.map((source, sourceIndex) =>
        index === sourceIndex ? { ...source, [key]: value } : source
      );

      handleSaveConfig(
        {
          ...config,
          pageSources: updatedPageSources,
        },
        false
      );
    },
    [config, handleSaveConfig]
  );

  const removePageSource = useCallback(
    (index: number) => {
      const filteredPageSources = config?.pageSources?.filter((source, sourceIndex) => index !== sourceIndex);

      handleSaveConfig(
        {
          ...config,
          pageSources: filteredPageSources,
        },
        false
      );
    },
    [config, handleSaveConfig]
  );

  const getPageSourcesValueBasedOnType = useCallback(
    (mode: AutoRecordingMode) => {
      switch (mode) {
        case AutoRecordingMode.ALL_PAGES:
          return [allPagesSourceData];

        case AutoRecordingMode.CUSTOM:
          return config?.pageSources;

        default:
          return [];
      }
    },
    [config?.pageSources]
  );

  const savePageSource = () => {
    if (
      config?.autoRecording?.mode === AutoRecordingMode.CUSTOM &&
      config?.pageSources.some((source) => source?.value?.length === 0)
    ) {
      toast.warn("Please provide page source value");
      return;
    }

    console.log("save....");
    handleSaveConfig({
      ...config,
      pageSources: getPageSourcesValueBasedOnType(config?.autoRecording?.mode),
    });
  };

  const addEmptyPageSource = () => {
    // setCustomPageSources((prevPageSources) => [{ ...emptyPageSourceData }, ...prevPageSources]);
  };

  const pageSourceColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text: string, _: unknown, index: number) => (
        <Select
          style={{ width: "100%", padding: "8px" }}
          value={text}
          size="small"
          className="recording-config"
          onChange={(value) => {
            setPageSourceValue(index, "key", value);
          }}
        >
          {[
            GLOBAL_CONSTANTS.URL_COMPONENTS.URL,
            GLOBAL_CONSTANTS.URL_COMPONENTS.HOST,
            GLOBAL_CONSTANTS.URL_COMPONENTS.PATH,
          ].map((value) => {
            return (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            );
          })}
        </Select>
      ),
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
      render: (text: string, _: unknown, index: number) => {
        return (
          <Select
            value={text}
            size="small"
            style={{ width: "100%" }}
            className="recording-config"
            onChange={(value) => {
              setPageSourceValue(index, "operator", value);
            }}
          >
            {Object.keys(GLOBAL_CONSTANTS.RULE_OPERATORS).map((key) => {
              return (
                <Select.Option key={key} value={GLOBAL_CONSTANTS.RULE_OPERATORS[key]}>
                  {key}
                </Select.Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text: string, _: unknown, index: number) => {
        return (
          <Input
            size="small"
            value={text}
            data-index={index}
            className="recording-config"
            onChange={(e) => {
              setPageSourceValue(index, "value", e.target.value);
            }}
          />
        );
      },
    },
    {
      title: "Actions",
      render: (text: string, record: unknown, index: number) => {
        return <Button size="small" icon={<DeleteOutlined />} onClick={() => removePageSource(index)} />;
      },
    },
    {
      title: "Actions",
      render: () => {
        return (
          <Button size="small" type="primary" onClick={() => savePageSource()}>
            Save
          </Button>
        );
      },
    },
  ];

  console.log({ switch: autoRecording?.isActive });

  const handleAutoRecordingToggle = useCallback(
    (status: boolean) => {
      console.log({ status });

      handleSaveConfig(
        {
          ...config,
          autoRecording: {
            ...config.autoRecording,
            isActive: status,
          },
        },
        false
      );

      toast.success(`Automatic recording is now ${status ? "enabled" : "disabled"}`);
    },
    [config, handleSaveConfig]
  );

  const handleConfigModeChange = useCallback(
    (e: RadioChangeEvent) => {
      handleSaveConfig(
        {
          ...config,
          autoRecording: {
            ...config.autoRecording,
            mode: e.target.value,
          },
        },
        false
      );
    },
    [config, handleSaveConfig]
  );

  return (
    <Row className="sessions-configuration-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        {/* TODO: add a back button */}
        <div className="header">Session Recording Settings</div>

        <div className="automatic-recording">
          <div className="automatic-recording-details">
            <div className="heading">Automatic recording</div>
            <div className="caption">Adjust the automatic recording rules</div>
          </div>

          <div className="automatic-recording-switch">
            <span>{autoRecording?.isActive ? "Enabled" : "Disabled"}</span>
            <Switch checked={!!autoRecording?.isActive} onChange={handleAutoRecordingToggle} />
          </div>

          <Radio.Group
            value={autoRecording?.mode ?? AutoRecordingMode.ALL_PAGES}
            disabled={!autoRecording?.isActive}
            onChange={handleConfigModeChange}
            className="automatic-recording-radio-group"
          >
            <Row align="bottom" justify="space-between">
              <Col span={14}>
                <ConfigurationRadioItem
                  value={AutoRecordingMode.ALL_PAGES}
                  title="All pages"
                  caption="Save up to last 5 minutes of activity on any tab."
                />
              </Col>

              <Col span={10}>
                <Row>
                  {/* TODO: update link */}
                  <a href="/" target="_blank" rel="noreferrer" className="learn-more-link ml-auto">
                    Recording all pages is safe & secure
                  </a>
                </Row>
              </Col>
            </Row>
            <div>
              <ConfigurationRadioItem
                value={AutoRecordingMode.CUSTOM}
                title="Specific pages"
                caption="Start recording automatically when you visit websites or URLs below."
              />
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                  <div>
                    <span>Page URLs where session should be recorded:</span>
                  </div>
                  {autoRecording?.mode === AutoRecordingMode.CUSTOM ? (
                    <>
                      <Button
                        size="small"
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={addEmptyPageSource}
                        style={{ margin: "10px 0 10px -8px" }}
                      >
                        Add page source
                      </Button>
                      {pageSources?.length ? (
                        <Table
                          rowKey={(_, i) => i}
                          columns={pageSourceColumns}
                          dataSource={config?.pageSources}
                          pagination={false}
                          showHeader={false}
                          bordered={false}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              </Space>
            </div>
          </Radio.Group>
        </div>
      </Col>
    </Row>
  );
};

export default ConfigurationPage;

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button, Col, Radio, RadioChangeEvent, Row, Switch } from "antd";
import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { ConfigurationRadioItem } from "./ConfigurationRadioItem";
import { isEqual } from "lodash";
import { toast } from "utils/Toast";
import { PageSourceRow } from "./PageSourceRow";
import { SourceKey, SourceOperator } from "types";
import { AutoRecordingMode, PageSource, SessionRecordingConfig } from "../types";
import { generateObjectId } from "utils/FormattingHelper";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import "./configurationPage.css";

const emptyPageSourceData: PageSource = {
  value: "",
  key: SourceKey.URL,
  operator: SourceOperator.CONTAINS,
  isActive: true,
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
  const navigate = useNavigate();
  const { config, handleSaveConfig } = useOutletContext<ParentContext>();
  const { pageSources = [], autoRecording } = config;
  const [showNewPageSource, setShowNewPageSource] = useState<boolean>(false);

  console.log({ receivedConfig: config });

  // one time migration for legacy configs
  useEffect(() => {
    if (Object.keys(config).length === 0 || config.autoRecording) return;

    console.log("migration running...");
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

    const migratedConfig = {
      ...config,
      maxDuration: 5,
      autoRecording: autoRecordingConfig,
      pageSources: config?.pageSources.map((source) => ({ ...source, id: generateObjectId(), isActive: true })) ?? [],
    };

    console.log("migration running...", migratedConfig);

    handleSaveConfig(migratedConfig, false);
  }, [config, handleSaveConfig]);

  console.log({ pageSources });

  const handleAddNewPageSourceClick = useCallback((e?: unknown) => {
    setShowNewPageSource(true);
  }, []);

  // useEffect(() => {
  //   if (pageSources.length > 0) return;

  //   if (autoRecording?.mode !== AutoRecordingMode.CUSTOM) return;

  //   if (pageSources.length === 0) {
  //     handleAddNewPageSourceClick();
  //     setEditPageSourceId(0);
  //   }
  // }, [autoRecording?.mode, pageSources.length, handleAddNewPageSourceClick]);

  const handleAutoRecordingToggle = useCallback(
    (status: boolean) => {
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

  const handleSavePageSourceDetails = useCallback(
    (sourceDetails: PageSource, isCreateMode?: boolean) => {
      const updatedPageSources = isCreateMode
        ? [...(config.pageSources ?? []), { id: generateObjectId(), ...sourceDetails }]
        : config.pageSources?.map((source) =>
            source.id === sourceDetails.id ? { ...source, ...sourceDetails } : source
          ) ?? [];

      handleSaveConfig({ ...config, pageSources: updatedPageSources }, false);

      if (isCreateMode) {
        setShowNewPageSource(false);
      }

      toast.success(`Successfully saved page source!`);
    },
    [config, handleSaveConfig]
  );

  const handlePageSourceStatusToggle = useCallback(
    (id: string, status: boolean) => {
      handleSaveConfig(
        {
          ...config,
          pageSources: config.pageSources?.map((source) =>
            id === source.id ? { ...source, isActive: status } : source
          ),
        },
        false
      );
    },
    [config, handleSaveConfig]
  );

  const handleDeletePageSource = useCallback(
    (id: string) => {
      handleSaveConfig(
        {
          ...config,
          pageSources: config.pageSources?.filter((source) => id !== source.id),
        },
        false
      );

      toast.success(`Page source deleted successfully!`);
    },
    [config, handleSaveConfig]
  );

  if (!isExtensionInstalled()) {
    return <InstallExtensionCTA eventPage="session_configuration" />;
  }

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
        <div className="header">
          <Button type="default" icon={<LeftOutlined />} onClick={() => redirectToSessionRecordingHome(navigate)} />
          <span>Session Recording Settings</span>
        </div>

        <div className="automatic-recording-container">
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

              {/* <Col span={10}>
                <Row>
                  <a href="/" target="_blank" rel="noreferrer" className="learn-more-link ml-auto">
                    Recording all pages is safe & secure
                  </a>
                </Row>
              </Col> */}
            </Row>
            <div className="specific-page-mode-container">
              <ConfigurationRadioItem
                value={AutoRecordingMode.CUSTOM}
                title="Specific pages"
                caption="Start recording automatically when you visit websites or URLs below."
              />

              <div className="page-source-list">
                {config.pageSources?.length > 0
                  ? config.pageSources?.map((source) => (
                      <PageSourceRow
                        key={source.id}
                        source={source}
                        disabled={!autoRecording?.isActive ?? false}
                        handleSavePageSourceDetails={handleSavePageSourceDetails}
                        handlePageSourceStatusToggle={handlePageSourceStatusToggle}
                        handleDeletePageSource={handleDeletePageSource}
                      />
                    ))
                  : null}

                {showNewPageSource ? (
                  <PageSourceRow
                    source={{ ...emptyPageSourceData }}
                    openInCreateMode={true}
                    disabled={!autoRecording?.isActive ?? false}
                    handleSavePageSourceDetails={handleSavePageSourceDetails}
                    handlePageSourceStatusToggle={handlePageSourceStatusToggle}
                    handleDeletePageSource={handleDeletePageSource}
                  />
                ) : (
                  <Button
                    block
                    disabled={!autoRecording?.isActive ?? false}
                    type="dashed"
                    icon={<PlusOutlined />}
                    className="add-new-source-btn"
                    onClick={handleAddNewPageSourceClick}
                  >
                    Add page source
                  </Button>
                )}
              </div>
            </div>
          </Radio.Group>
        </div>
      </Col>
    </Row>
  );
};

export default ConfigurationPage;

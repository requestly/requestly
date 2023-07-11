import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Col, Radio, RadioChangeEvent, Row, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SessionSettingsRadioItem } from "./SessionSettingsRadioItem";
import { getAppMode } from "store/selectors";
import { isEqual } from "lodash";
import { toast } from "utils/Toast";
import { PageSourceRow } from "./PageSourceRow";
import { SourceKey, SourceOperator } from "types";
import { AutoRecordingMode, PageSource, SessionRecordingConfig } from "../types";
import { generateObjectId } from "utils/FormattingHelper";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { RQButton } from "lib/design-system/components";
import { isExtensionInstalled } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";
import { StorageService } from "init";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackConfigurationOpened, trackConfigurationSaved } from "modules/analytics/events/features/sessionRecording";
import "./sessionsSettingsPage.css";

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

const defaultSessionRecordingConfig: SessionRecordingConfig = {
  maxDuration: 5,
  pageSources: [],
  autoRecording: {
    isActive: false,
    mode: AutoRecordingMode.ALL_PAGES,
  },
};

const SessionsSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [config, setConfig] = useState<SessionRecordingConfig>({});
  const [showNewPageSource, setShowNewPageSource] = useState<boolean>(false);
  const { autoRecording } = config;

  const getPageSourceLabel = useCallback((source: PageSource): string => {
    const upperCasedSourceKey = source.key.toUpperCase();

    if (source.operator === SourceOperator.MATCHES) {
      return `${upperCasedSourceKey} matches regex: ${source.value}`;
    } else if (source.operator === SourceOperator.WILDCARD_MATCHES) {
      return `${upperCasedSourceKey} matches wildcard: ${source.value}`;
    } else {
      return `${upperCasedSourceKey} ${source.operator.toLowerCase()}: ${source.value}`;
    }
  }, []);

  useEffect(() => {
    trackConfigurationOpened();
  }, []);

  const handleSaveConfig = useCallback(
    async (newConfig: SessionRecordingConfig, showToast = true) => {
      Logger.log("Writing storage in handleSaveConfig");
      await StorageService(appMode).saveSessionRecordingPageConfig(newConfig);
      setConfig(newConfig);

      if (showToast) {
        toast.success("Settings saved successfully.");
      }

      trackConfigurationSaved({
        maxDuration: newConfig?.maxDuration,
        pageSources: newConfig?.pageSources?.length ?? 0,
        autoRecordingMode: newConfig?.autoRecording?.mode,
        isAutoRecordingActive: newConfig?.autoRecording?.isActive,
      });
    },
    [appMode]
  );

  useEffect(() => {
    Logger.log("Reading storage in SessionsIndexPage");
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.SESSION_RECORDING_CONFIG)
      .then((config) => {
        if (!config || Object.keys(config).length === 0) return defaultSessionRecordingConfig;

        if (config.autoRecording) return config; // config already migrated

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
        } else if (pageSourcesLength === 1 && isEqual(config?.pageSources?.[0], allPagesSourceData)) {
          autoRecordingConfig.isActive = true;
          autoRecordingConfig.mode = AutoRecordingMode.ALL_PAGES;
        }

        const migratedConfig = {
          ...config,
          maxDuration: 5,
          autoRecording: autoRecordingConfig,
          pageSources:
            config?.pageSources?.map((source: PageSource) => ({ ...source, id: generateObjectId(), isActive: true })) ??
            [],
        };

        return migratedConfig;
      })
      .then((config) => setConfig(config || {}));
  }, [appMode]);

  useEffect(() => {
    if (!isWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_ENABLED, config?.pageSources?.length > 0);
    }
  }, [config?.pageSources?.length, isWorkspaceMode]);

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

  const handleAddNewPageSourceClick = useCallback((e?: unknown) => {
    setShowNewPageSource(true);
  }, []);

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
    return <InstallExtensionCTA eventPage="session_settings" />;
  }

  const isPageSourcesDisabled =
    (!autoRecording?.isActive || autoRecording?.mode === AutoRecordingMode.ALL_PAGES) ?? false;

  return (
    <Row className="session-settings-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        <div className="header">
          <RQButton
            iconOnly
            type="default"
            icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
            onClick={() => redirectToSessionRecordingHome(navigate)}
          />
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
              <Col span={24}>
                <SessionSettingsRadioItem
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
              <SessionSettingsRadioItem
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
                        disabled={isPageSourcesDisabled}
                        handleSavePageSourceDetails={handleSavePageSourceDetails}
                        handlePageSourceStatusToggle={handlePageSourceStatusToggle}
                        handleDeletePageSource={handleDeletePageSource}
                        getPageSourceLabel={getPageSourceLabel}
                      />
                    ))
                  : null}

                {showNewPageSource || config.pageSources === undefined || config.pageSources?.length === 0 ? (
                  <PageSourceRow
                    source={{ ...emptyPageSourceData }}
                    openInCreateMode={true}
                    disabled={isPageSourcesDisabled}
                    handleSavePageSourceDetails={handleSavePageSourceDetails}
                    handlePageSourceStatusToggle={handlePageSourceStatusToggle}
                    handleDeletePageSource={handleDeletePageSource}
                    getPageSourceLabel={getPageSourceLabel}
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

export default SessionsSettingsPage;

import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Col, Radio, RadioChangeEvent, Row, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SessionSettingsRadioItem } from "./components/SessionSettingsRadioItem";
import { getAppMode } from "store/selectors";
import { isEqual } from "lodash";
import { toast } from "utils/Toast";
import { PageSourceRow } from "./components/PageSourceRow";
import { SessionRecordingPageSource } from "types";
import { AutoRecordingMode, SessionRecordingConfig } from "features/sessionBook";
import { generateObjectId } from "utils/FormattingHelper";
import { isExtensionInstalled, isSafariBrowser } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import APP_CONSTANTS from "config/constants";
import Logger from "lib/logger";
import { StorageService } from "init";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackConfigurationOpened, trackConfigurationSaved } from "modules/analytics/events/features/sessionRecording";
import "./sessionsSettings.css";
import { RuleSourceKey, RuleSourceOperator } from "@requestly/shared/types/entities/rules";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";
import clientSessionRecordingStorageService from "services/clientStorageService/features/session-recording";
import { SessionBookDeprecationBanner } from "features/sessionBook/components/SessionBookDeprecationBanner";

const emptyPageSourceData: SessionRecordingPageSource = {
  value: "",
  key: RuleSourceKey.URL,
  operator: RuleSourceOperator.CONTAINS,
  isActive: true,
};

const allPagesSourceData = {
  value: "*",
  key: RuleSourceKey.URL,
  operator: RuleSourceOperator.WILDCARD_MATCHES,
};

export const defaultSessionRecordingConfig: SessionRecordingConfig = {
  maxDuration: 5,
  pageSources: [],
  autoRecording: {
    isActive: false,
    mode: AutoRecordingMode.ALL_PAGES,
  },
};

export const SessionsSettings: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const [config, setConfig] = useState<SessionRecordingConfig>({});
  const [showNewPageSource, setShowNewPageSource] = useState<boolean>(false);
  const { autoRecording } = config;
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("session_recording", "update");

  const getPageSourceLabel = useCallback((source: SessionRecordingPageSource): string => {
    const upperCasedSourceKey = source.key.toUpperCase();

    if (source.operator === RuleSourceOperator.MATCHES) {
      return `${upperCasedSourceKey} matches regex: ${source.value}`;
    } else if (source.operator === RuleSourceOperator.WILDCARD_MATCHES) {
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
    clientSessionRecordingStorageService
      .getSessionRecordingConfig()
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
            config?.pageSources?.map((source: SessionRecordingPageSource) => ({
              ...source,
              id: generateObjectId(),
              isActive: true,
            })) ?? [],
        };

        return migratedConfig;
      })
      .then((config) => setConfig(config || {}));
  }, [appMode]);

  useEffect(() => {
    if (!isSharedWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_ENABLED, config?.pageSources?.length > 0);
    }
  }, [config?.pageSources?.length, isSharedWorkspaceMode]);

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
    (sourceDetails: SessionRecordingPageSource, isCreateMode?: boolean) => {
      const updatedPageSources: SessionRecordingPageSource[] = isCreateMode
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

  if (isSafariBrowser()) {
    return <SafariLimitedSupportView />;
  }

  if (!isExtensionInstalled()) {
    return <InstallExtensionCTA eventPage="session_settings" />;
  }

  const isPageSourcesDisabled =
    (!isValidPermission || !autoRecording?.isActive || autoRecording?.mode === AutoRecordingMode.ALL_PAGES) ?? false;

  return (
    <div className="session-settings-container">
      <div className="session-settings-wrapper">
        <Col flex="1">
          <div className="header">SessionBook Settings</div>

          <SessionBookDeprecationBanner style={{ marginBottom: 24 }} />

          <div className="automatic-recording-container">
            <div className="automatic-recording-details">
              <div className="heading">Automatic recording</div>
              <div className="caption">Adjust the automatic recording rules</div>
            </div>

            <div className="automatic-recording-switch">
              <span>{autoRecording?.isActive ? "Enabled" : "Disabled"}</span>
              <Switch
                disabled={!isValidPermission}
                checked={!!autoRecording?.isActive}
                onChange={handleAutoRecordingToggle}
              />
            </div>

            <Radio.Group
              value={autoRecording?.mode ?? AutoRecordingMode.ALL_PAGES}
              disabled={!autoRecording?.isActive || !isValidPermission}
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
                      disabled={!autoRecording?.isActive || !isValidPermission}
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
      </div>
    </div>
  );
};

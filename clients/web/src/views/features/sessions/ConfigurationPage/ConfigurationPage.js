import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, Input, Select, Button, Space, Table, Col, Row } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "../../../../utils/Toast";
import { isEqual } from "lodash";
import { getAppMode } from "store/selectors";
import Logger from "lib/logger";
import { StorageService } from "init";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { RQButton } from "lib/design-system/components";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { isExtensionInstalled, isSafariBrowser } from "actions/ExtensionActions";
import { trackConfigurationOpened, trackConfigurationSaved } from "modules/analytics/events/features/sessionRecording";
import "./configurationPage.css";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import clientSessionRecordingStorageService from "services/clientStorageService/features/session-recording";

const emptyPageSourceData = {
  key: GLOBAL_CONSTANTS.URL_COMPONENTS.URL,
  operator: GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS,
  value: "",
};

const allPagesSourceData = {
  key: GLOBAL_CONSTANTS.URL_COMPONENTS.URL,
  operator: GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES,
  value: "*",
};

const PAGE_SOURCES_TYPE = {
  CUSTOM: "custom",
  ALL_PAGES: "all-pages",
  NO_PAGES: "no-pages",
};

const ConfigurationPage = () => {
  const [config, setConfig] = useState({});
  const navigate = useNavigate();
  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const [customPageSources, setCustomPageSources] = useState([]);
  const [pageSourceType, setPageSourceType] = useState(PAGE_SOURCES_TYPE.ALL_PAGES);
  const inputRef = useRef(null);

  useEffect(() => {
    trackConfigurationOpened();
  }, []);

  const handleSaveConfig = useCallback(
    async (newConfig) => {
      Logger.log("Writing storage in handleSaveConfig");
      await StorageService(appMode).saveSessionRecordingPageConfig(newConfig);
      setConfig(newConfig);
      toast.success("Saved configuration successfully.");
      trackConfigurationSaved({
        pageSources: newConfig.pageSources.length,
        maxDuration: newConfig.maxDuration,
      });
    },
    [appMode]
  );

  useEffect(() => {
    if (inputRef.current?.input?.dataset.index === "0") {
      inputRef.current.input.focus();
    }
  }, [customPageSources, pageSourceType]);

  useEffect(() => {
    Logger.log("Reading storage in SessionsIndexPage");
    clientSessionRecordingStorageService
      .getSessionRecordingConfig()
      .then((savedConfig) => setConfig(savedConfig || {}));
  }, []);

  useEffect(() => {
    if (!isSharedWorkspaceMode) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_ENABLED, config?.pageSources?.length > 0);
    }
  }, [config?.pageSources?.length, isSharedWorkspaceMode]);

  useEffect(() => {
    const initialCustomPageSources = [{ ...emptyPageSourceData }];

    if (config.pageSources?.length === 1 && isEqual(config.pageSources?.[0], allPagesSourceData)) {
      setPageSourceType(PAGE_SOURCES_TYPE.ALL_PAGES);
      setCustomPageSources(initialCustomPageSources);
    } else if (config.pageSources?.length > 0) {
      setPageSourceType(PAGE_SOURCES_TYPE.CUSTOM);
      setCustomPageSources(config.pageSources);
    } else {
      setPageSourceType(PAGE_SOURCES_TYPE.NO_PAGES);
      setCustomPageSources(initialCustomPageSources);
    }
  }, [config]);

  const setPageSourceValue = (index, key, value) => {
    const newPageSources = [...customPageSources];
    newPageSources[index][key] = value;
    setCustomPageSources(newPageSources);
  };

  const removePageSource = (index) => {
    const newPageSources = [...customPageSources];
    newPageSources.splice(index, 1);
    setCustomPageSources(newPageSources);
  };

  const getPageSourcesValueBasedOnType = () => {
    switch (pageSourceType) {
      case PAGE_SOURCES_TYPE.ALL_PAGES:
        return [allPagesSourceData];

      case PAGE_SOURCES_TYPE.CUSTOM:
        return customPageSources;

      case PAGE_SOURCES_TYPE.NO_PAGES:
        return [];

      default:
        return [];
    }
  };

  const savePageSource = () => {
    if (
      pageSourceType === PAGE_SOURCES_TYPE.CUSTOM &&
      customPageSources.some((source) => source?.value?.length === 0)
    ) {
      toast.warn("Please provide page source value");
      return;
    }

    handleSaveConfig({
      ...config,
      pageSources: getPageSourcesValueBasedOnType(),
      maxDuration: 5,
    });
  };

  const addEmptyPageSource = () => {
    setCustomPageSources((prevPageSources) => [{ ...emptyPageSourceData }, ...prevPageSources]);
  };

  if (isSafariBrowser()) {
    return <SafariLimitedSupportView />;
  }

  if (!isExtensionInstalled()) {
    return <InstallExtensionCTA eventPage="session_settings" />;
  }

  const pageSourceColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text, _, index) => (
        <Select
          style={{ width: "100%" }}
          value={text}
          className="source-key-config"
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
                {value.toUpperCase()}
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
      render: (text, _, index) => {
        return (
          <Select
            value={text}
            style={{ width: "100%" }}
            className="source-operator-config"
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
      render: (text, _, index) => {
        return (
          <Input
            size="small"
            value={text}
            ref={inputRef}
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
      render: (text, record, index) => {
        return <Button size="small" icon={<DeleteOutlined />} onClick={() => removePageSource(index)} />;
      },
    },
  ];

  return (
    <Row className="configuration-container ">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Row className="w-full header-container" wrap={false} align="middle" justify="space-between">
              <div className="header">
                <RQButton
                  iconOnly
                  type="default"
                  icon={<img alt="back" width="14px" height="12px" src="/assets/media/common/left-arrow.svg" />}
                  onClick={() => redirectToSessionRecordingHome(navigate, isDesktopSessionsCompatible)}
                />
                <span>SessionBook Settings</span>
              </div>

              <Button type="primary" onClick={savePageSource} className="ml-auto">
                Save
              </Button>
            </Row>
            <div>
              <span>Page URLs where session should be recorded:</span>
              <Select
                style={{ width: "150px", marginLeft: "10px" }}
                value={pageSourceType}
                size="small"
                onChange={setPageSourceType}
              >
                <Select.Option value={PAGE_SOURCES_TYPE.ALL_PAGES}>All Pages</Select.Option>
                <Select.Option value={PAGE_SOURCES_TYPE.CUSTOM}>Custom Pages</Select.Option>
                <Select.Option value={PAGE_SOURCES_TYPE.NO_PAGES}>No Pages</Select.Option>
              </Select>
            </div>
            {pageSourceType === PAGE_SOURCES_TYPE.CUSTOM ? (
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
                {customPageSources.length ? (
                  <Table
                    rowKey={(_, i) => i}
                    columns={pageSourceColumns}
                    dataSource={customPageSources}
                    pagination={false}
                    showHeader={false}
                    bordered={false}
                    className="config-page-sources-table"
                  />
                ) : null}
              </>
            ) : null}
          </div>
          <div>
            <Alert
              showIcon
              type={pageSourceType === PAGE_SOURCES_TYPE.NO_PAGES ? "warning" : "info"}
              message={
                pageSourceType === PAGE_SOURCES_TYPE.NO_PAGES
                  ? "All the page sources in custom pages configuration will be removed!"
                  : "Activity for only last 5 minutes will be recorded in any session."
              }
              style={{ padding: "4px 12px" }}
            />
          </div>
        </Space>
      </Col>
    </Row>
  );
};

export default ConfigurationPage;

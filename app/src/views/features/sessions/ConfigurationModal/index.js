import React, { useEffect, useRef, useState } from "react";
import { Alert, Input, Modal, Select, Button, Space, Table } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "../../../../utils/Toast";
import { isEqual } from "lodash";

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

const ConfigurationModal = ({ config, isModalVisible, handleSaveConfig, handleCancelModal }) => {
  const [customPageSources, setCustomPageSources] = useState([]);
  const [pageSourceType, setPageSourceType] = useState(PAGE_SOURCES_TYPE.ALL_PAGES);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isModalVisible && inputRef.current?.input?.dataset.index === "0") {
      inputRef.current.input.focus();
    }
  }, [isModalVisible, customPageSources, pageSourceType]);

  useEffect(() => {
    const initialCustomPageSources = [{ ...emptyPageSourceData }];

    if (isModalVisible) {
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
    }
  }, [config, isModalVisible]);

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

  const pageSourceColumns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text, _, index) => (
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
      render: (text, _, index) => {
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
    <Modal
      title="Edit configuration"
      visible={isModalVisible}
      onCancel={handleCancelModal}
      width="50%"
      okText="Save"
      onOk={savePageSource}
      bodyStyle={{ padding: 24 }}
      maskClosable={false}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
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
        {/* <div>
          <span>Time duration for which session should be recorded:</span>
          <Select
            style={{ width: "150px", marginLeft: "10px" }}
            value={maxDuration}
            size="small"
            onChange={setMaxDuration}
          >
            <Select.Option value={1}>1 min</Select.Option>
            <Select.Option value={5}>5 min (default)</Select.Option>
            <Select.Option value={10}>10 min</Select.Option>
            <Select.Option value={15}>15 min</Select.Option>
            <Select.Option value={30}>30 min</Select.Option>
          </Select>
        </div> */}
      </Space>
    </Modal>
  );
};

export default ConfigurationModal;

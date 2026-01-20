import { useEffect, useState } from "react";
import { Modal, Typography, Table, Switch, Button, Select, Input, message, Row, Col } from "antd";
import { DeleteOutlined, PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

const { Text, Title } = Typography;

const SSLProxyingModal = ({ isVisible, setIsVisible }) => {
  const [enabledAll, setEnabledAll] = useState(true);
  const [sourceList, setSourceList] = useState([]);

  const sourceColumns = [
    // {
    //     title: 'Id',
    //     dataIndex: 'id',
    //     key: 'id',
    //     render: text => <Text code>{text}</Text>,
    // },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render: (text) => <Text code>{GLOBAL_CONSTANTS.URL_COMPONENTS.HOST}</Text>,
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
      render: (text, record, index) => {
        return (
          <Select
            value={text}
            size="small"
            onChange={(value) => {
              changeSourceData(index, "operator", value);
            }}
          >
            {Object.keys(GLOBAL_CONSTANTS.RULE_OPERATORS).map((key) => {
              return <Select.Option value={GLOBAL_CONSTANTS.RULE_OPERATORS[key]}>{key}</Select.Option>;
            })}
          </Select>
        );
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record, index) => {
        return (
          <Input
            value={text}
            onChange={(e) => {
              changeSourceData(index, "value", e.target.value);
            }}
          />
        );
      },
    },
    {
      title: "Actions",
      render: (text, record, index) => {
        return <Button size="small" icon={<DeleteOutlined />} onClick={() => removeSource(index)} />;
      },
    },
  ];

  useEffect(() => {
    const doIt = async () => {
      let action_type = "SSL_PROXYING:GET_EXCLUSION_LIST";
      if (!enabledAll) {
        action_type = "SSL_PROXYING:GET_INCLUSION_LIST";
      }

      const sslProxyingData = await window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
        type: "SSL_PROXYING:GET_ALL",
        payload: {},
      });

      let _enabledAll = sslProxyingData?.enabledAll;
      if (_enabledAll === undefined || _enabledAll === null) {
        _enabledAll = true;
      }
      setEnabledAll(_enabledAll);

      const _sourceList = await window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
        type: action_type,
        payload: {},
      });
      setSourceList(_sourceList);
    };
    doIt();
  }, [isVisible, enabledAll]);

  const changeSourceData = (sourceIndex, sourceKey, sourceValue) => {
    const newSourceList = [...sourceList];
    newSourceList[sourceIndex][sourceKey] = sourceValue;
    setSourceList(newSourceList);
  };

  const removeSource = (index) => {
    const newSourceList = [...sourceList];
    newSourceList.splice(index, 1);
    setSourceList(newSourceList);
  };

  const handleOnEnableChange = (checked) => {
    setEnabledAll(checked);
    const action_type = checked ? "SSL_PROXYING:ENABLE_ALL" : "SSL_PROXYING:DISABLE_ALL";

    window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
      type: action_type,
      payload: {
        data: sourceList,
      },
    });
  };

  const renderEnabledAll = () => {
    return (
      <Row justify="start" gutter={32}>
        <Col>
          <Title level={5}>Enable All</Title>
        </Col>
        <Col>
          <Switch defaultChecked={enabledAll} onChange={handleOnEnableChange} />
        </Col>
        {enabledAll ? (
          <Text code>
            <InfoCircleOutlined /> Intercepting all SSL traffic except Exclusion List Rules
          </Text>
        ) : (
          <Text code>
            <InfoCircleOutlined /> Intercepting SSL traffic only matching Inclusion List Rules
          </Text>
        )}
        <Col></Col>
      </Row>
    );
  };

  const renderSourceList = () => {
    return (
      <>
        <Title level={5}>
          {enabledAll ? "Exclusion List" : "Inclusion List"}
          &nbsp;&nbsp;
          <Button size="small" shape="circle" type="primary" icon={<PlusOutlined />} onClick={addEmptySource} />
        </Title>
        <Table rowKey={"id"} columns={sourceColumns} dataSource={sourceList} pagination={false} showHeader={false} />
      </>
    );
  };

  const addEmptySource = () => {
    const source = {
      id: uuidv4(),
      key: GLOBAL_CONSTANTS.RULE_KEYS.HOST,
      operator: GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS,
      value: "example.com",
    };

    const newSourceList = [...sourceList];
    newSourceList.unshift(source);
    setSourceList(newSourceList);
  };

  const saveSourcesList = () => {
    let action_type = enabledAll ? "SSL_PROXYING:UPDATE_EXCLUSION_LIST" : "SSL_PROXYING:UPDATE_INCLUSION_LIST";

    // Exclusion List
    window?.RQ?.DESKTOP?.SERVICES?.IPC.invokeEventInMain("rq-storage:storage-action", {
      type: action_type,
      payload: {
        data: sourceList,
      },
    });
    message.success("Saved SSL Proxying List");
  };

  return (
    <Modal
      title="SSL Proxying"
      visible={isVisible}
      onCancel={() => {
        setIsVisible(false);
      }}
      bodyStyle={{ padding: 16 }}
      okText={"Save"}
      width="50%"
      onOk={saveSourcesList}
      cancelText={"Close"}
    >
      {renderEnabledAll()}
      {renderSourceList()}
    </Modal>
  );
};

export default SSLProxyingModal;

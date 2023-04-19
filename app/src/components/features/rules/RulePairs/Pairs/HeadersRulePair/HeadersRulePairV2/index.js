import React, { useCallback, useState, useEffect } from "react";
import { Alert, Badge, Button, Card, Col, Row, Space, Tabs } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import HeadersPairModificationRowV2 from "./HeadersPairModificationRowV2";
import { generateObjectId } from "../../../../../../../utils/FormattingHelper";
import { EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "../../../../../../../utils/RedirectionUtils";
import { isDesktopMode } from "../../../../../../../utils/AppUtils";

const HeadersRulePairV2 = ({ pair, pairIndex, helperFunctions, isInputDisabled, ruleDetails }) => {
  //Utils
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };

  const [activeTab, setActiveTab] = useState("Request");

  const { pushValueToArrayInPair, deleteArrayValueByIndexInPair } = helperFunctions;

  const getEmptyModification = (type = GLOBAL_CONSTANTS.MODIFICATION_TYPES.ADD) => {
    return {
      ...ruleDetails.EMPTY_MODIFICATION_FORMAT,
      id: generateObjectId(),
      type,
    };
  };

  const addEmptyModification = (modificationType, type) => {
    pushValueToArrayInPair(null, pairIndex, ["modifications", modificationType], stableGetEmptyModification(type));
  };

  const stableGetEmptyModification = useCallback(getEmptyModification, [ruleDetails.EMPTY_MODIFICATION_FORMAT]);

  const deleteModification = (event, pairIndex, modificationIndex, modificationType) => {
    deleteArrayValueByIndexInPair(event, pairIndex, ["modifications", modificationType], modificationIndex);
  };

  useEffect(() => {
    if (!pair.modifications.Request?.length && pair.modifications.Response?.length) {
      setActiveTab("Response");
    }
  }, [pair.modifications]);

  return (
    <Col span={24}>
      <div className="card-container">
        <Tabs type="line" tabBarGutter={16} activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ margin: 0 }}>
          {["Request", "Response"].map((modificationType) => (
            <Tabs.TabPane
              tab={
                <span>
                  {`${modificationType} Headers`}
                  <Badge
                    count={pair.modifications[modificationType]?.length}
                    size="small"
                    style={{ margin: "0 5px" }}
                  />
                </span>
              }
              key={modificationType}
            >
              <Card bordered={false} className="headers-rule-pair-card">
                {pair.modifications[modificationType]?.map((modification, modificationIndex) => (
                  <HeadersPairModificationRowV2
                    modification={modification}
                    modificationIndex={modificationIndex}
                    pairIndex={pairIndex}
                    isInputDisabled={isInputDisabled}
                    helperFunctions={{
                      ...helperFunctions,
                      deleteModification,
                    }}
                    modificationType={modificationType}
                    key={modificationIndex}
                  />
                ))}
                <Row span={24} align="middle">
                  {pair.modifications[modificationType]?.length ? (
                    <Col offset={3} span={21}>
                      <Button
                        type="dashed"
                        onClick={() => addEmptyModification(activeTab)}
                        icon={<PlusOutlined />}
                        disabled={isInputDisabled}
                      >
                        <span className="btn-inner--text">Add Modification</span>
                      </Button>
                    </Col>
                  ) : (
                    <Col span={24}>
                      <Space>
                        <Button
                          type="dashed"
                          onClick={() => addEmptyModification(activeTab, GLOBAL_CONSTANTS.MODIFICATION_TYPES.ADD)}
                          icon={<PlusOutlined />}
                        >
                          <span className="btn-inner--text">{`Add ${modificationType} Header`}</span>
                        </Button>
                        <Button
                          type="dashed"
                          onClick={() => addEmptyModification(activeTab, GLOBAL_CONSTANTS.MODIFICATION_TYPES.REMOVE)}
                          icon={<MinusOutlined />}
                        >
                          <span className="btn-inner--text">{`Remove ${modificationType} Header`}</span>
                        </Button>
                        <Button
                          type="dashed"
                          onClick={() => addEmptyModification(activeTab, GLOBAL_CONSTANTS.MODIFICATION_TYPES.MODIFY)}
                          icon={<EditOutlined />}
                        >
                          <span className="btn-inner--text">{`Override ${modificationType} Header`}</span>
                        </Button>
                      </Space>
                    </Col>
                  )}
                </Row>
                {modificationType === "Response" && !isDesktopMode() ? (
                  <Row className="margin-top-one line-clamp">
                    <Alert
                      className="alert"
                      message="Response Headers modification done by Requestly are not visible in Browsers devtool but they are actually modified."
                      type="info"
                      showIcon
                      style={{
                        padding: "4px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </Row>
                ) : modificationType === "Request" && isDesktopMode() ? (
                  <Row className="margin-top-one">
                    <Col span={24}>
                      <Alert
                        message={
                          <span style={{ whiteSpace: "pre-wrap" }}>
                            Request Headers modification done by Requestly are not visible in the Browsers devtool but
                            they are actually modified. You can see the original headers in the Requestly Traffic
                            logger.
                          </span>
                        }
                        type="info"
                        showIcon
                        action={
                          <>
                            &nbsp;
                            <Button shape="round" onClick={navigateToTraffic}>
                              See Traffic
                            </Button>
                          </>
                        }
                        style={{
                          padding: "4px",
                          fontSize: "0.8rem",
                        }}
                      />
                    </Col>
                  </Row>
                ) : null}
              </Card>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    </Col>
  );
};

export default HeadersRulePairV2;

import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Button, Card } from "antd";
import { Modal } from "antd";
import { NavLink } from "react-router-dom";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isExtensionVersionCompatible } from "actions/ExtensionActions";
import { getAppMode } from "store/selectors";
import { RightOutlined } from "@ant-design/icons";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";

const { PATHS, RULE_TYPES_CONFIG } = APP_CONSTANTS;

export const NewRuleSelector = (props) => {
  // GLOBAL STATE
  const appMode = useSelector(getAppMode);

  const handleCreateClick = (ruleConfigType) => {
    trackRuleCreationWorkflowStartedEvent(ruleConfigType, "screen");
  };

  return (
    <Modal
      // className="modal-dialog-centered max-width-70-percent"
      visible={props.isOpen}
      onCancel={props.toggle}
      footer={null}
      title="Create New Rule"
      width={1000}
    >
      <div>
        <Row gutter={[16, 16]}>
          {Object.entries(RULE_TYPES_CONFIG).map(([key, RULE_CONFIG]) => {
            // To check extension version for delay rule compatibility
            if (
              appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION &&
              RULE_CONFIG.TYPE === GLOBAL_CONSTANTS.RULE_TYPES.DELAY
            ) {
              if (!isExtensionVersionCompatible(APP_CONSTANTS.DELAY_COMPATIBILITY_VERSION)) {
                console.log("Delay Rule is not compatible with your extension version");
                return null;
              }
            }

            if (RULE_CONFIG.HIDE) {
              return null;
            }

            if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && RULE_CONFIG.HIDE_IN_EXTENSION) {
              return null;
            }

            return (
              <Col xs={24} sm={12} lg={8} key={RULE_CONFIG.ID}>
                <Card
                  loading={false}
                  hoverable={true}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexFlow: "column",
                    cursor: "default",
                  }}
                  size="small"
                  bodyStyle={{ flexGrow: "1" }}
                  actions={[
                    <NavLink to={`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${RULE_CONFIG.TYPE}`}>
                      <Button
                        type="primary"
                        icon={<RightOutlined />}
                        onClick={() => handleCreateClick(RULE_CONFIG.TYPE)}
                      >
                        Create
                      </Button>
                    </NavLink>,
                  ]}
                >
                  <Card.Meta
                    avatar={<>{React.createElement(RULE_CONFIG.ICON)}</>}
                    title={<>{RULE_CONFIG.NAME + " "}</>}
                    description={RULE_CONFIG.DESCRIPTION}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </Modal>
  );
};

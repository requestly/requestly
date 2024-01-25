import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Modal, Button } from "antd";
import RuleBuilder from "../../../features/rules/RuleBuilder";
import { saveRule } from "../../../features/rules/RuleBuilder/Header/ActionButtons/actions/index";
import { redirectToRuleEditor } from "../../../../utils/RedirectionUtils";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { actions } from "store";
import { trackTemplateImportCompleted, trackTemplateImportStarted } from "modules/analytics/events/features/templates";
import { snakeCase } from "lodash";
import { generateObjectId } from "utils/FormattingHelper";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.css";
import Logger from "lib/logger";
import { toast } from "utils/Toast";

const RulePreviewModal = ({ rule, isOpen, toggle, source }) => {
  const navigate = useNavigate();
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const createdBy = user?.details?.profile?.uid || null;
  const currentOwner = user?.details?.profile?.uid || null;
  const saveRuleTemplate = (ruleObj) => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      if (!isExtensionInstalled()) {
        dispatch(
          actions.toggleActiveModal({
            modalName: "extensionModal",
            newValue: true,
            newProps: {},
          })
        );
        return;
      }
    }

    const modificationDate = Date.now();

    const ruleToSave = {
      ...ruleObj.ruleDefinition,
      id: `${ruleObj.ruleDefinition.ruleType}_${generateObjectId()}`,
      createdBy,
      currentOwner,
      modificationDate,
    };

    //triggering started event here for home screen because started event is triggered from templates list page.g
    if (source === AUTH.SOURCE.HOME_SCREEN) trackTemplateImportStarted(snakeCase(ruleToSave.name), source);
    saveRule(appMode, ruleToSave)
      .then(() => {
        trackTemplateImportCompleted(snakeCase(ruleToSave.name), source);
        redirectToRuleEditor(navigate, ruleToSave.id, "templates");
      })
      .catch((e) => {
        Logger.log("saveRuleTemplate Error in saving rule:", e);
        toast.error("Error in saving rule. Please contact support.");
      });
  };

  return (
    <Modal
      className="modal-dialog-centered max-width-80-percent rule-preview-modal"
      open={isOpen}
      onCancel={toggle}
      footer={null}
      title={
        <Row justify="space-between" align="middle">
          <Col flex="auto">{rule.ruleDefinition.name} (Preview Mode)</Col>
          <Col flex="none" style={{ marginRight: "2rem" }}>
            {" "}
            <Button type="primary" onClick={() => saveRuleTemplate(rule)}>
              Use this template
            </Button>
          </Col>
        </Row>
      }
      width="90%"
    >
      <RuleBuilder rule={rule.ruleDefinition} isSharedListViewRule={true} />
    </Modal>
  );
};

export default RulePreviewModal;

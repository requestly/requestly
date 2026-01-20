import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { snakeCase } from "lodash";
import { trackTemplateImportCompleted, trackTemplateImportStarted } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { generateObjectId } from "utils/FormattingHelper";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { saveRule } from "views/features/rules/RuleEditor/components/Header/ActionButtons/actions";
import { LOGGER as Logger } from "@requestly/utils";
import { toast } from "utils/Toast";
import { Button, Col, Modal, Row } from "antd";
import RuleBuilder from "components/features/rules/RuleBuilder";
import { SOURCE } from "modules/analytics/events/common/constants";
import { TemplateData } from "../../components/TemplatesTable/types";
import { RoleBasedComponent } from "features/rbac";
import "./templatePreviewModal.css";

interface TemplatePreviewModalProps {
  rule: TemplateData;
  isOpen: boolean;
  toggle: () => void;
  source: string;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ rule, isOpen, toggle, source }) => {
  const navigate = useNavigate();
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const createdBy = user?.details?.profile?.uid || null;
  const currentOwner = user?.details?.profile?.uid || null;
  const saveRuleTemplate = (ruleObj: TemplateData) => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      if (!isExtensionInstalled()) {
        dispatch(
          globalActions.toggleActiveModal({
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
    if (source === SOURCE.HOME_SCREEN) trackTemplateImportStarted(snakeCase(ruleToSave.name), source);
    saveRule(appMode, dispatch, ruleToSave)
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
            <RoleBasedComponent resource="http_rule" permission="create">
              <Button type="primary" onClick={() => saveRuleTemplate(rule)}>
                Use this template
              </Button>
            </RoleBasedComponent>
          </Col>
        </Row>
      }
      width="90%"
    >
      <RuleBuilder rule={rule.ruleDefinition} isSharedListViewRule={true} />
    </Modal>
  );
};

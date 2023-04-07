import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'antd';
import { getActiveModals, getCurrentlySelectedRuleConfig, getCurrentlySelectedRuleData } from 'store/selectors';
import { RQEditorTitle, RQModal } from 'lib/design-system/components';
import RulePairs from 'components/features/rules/RulePairs';
import AddPairButton from 'components/features/rules/RuleBuilder/Body/Columns/AddPairButton';
import CreateRuleButton from 'components/features/rules/RuleBuilder/Header/ActionButtons/CreateRuleButton';
import RULE_TYPES_CONFIG from 'config/constants/sub/rule-types';
import { onChangeHandler } from 'components/features/rules/RuleBuilder/Body/actions';
import { actions } from 'store';
import {
  setCurrentlySelectedRule,
  setCurrentlySelectedRuleConfig,
  initiateBlankCurrentlySelectedRule,
} from 'components/features/rules/RuleBuilder/actions';
import { Rule, Status } from 'types';
import './RuleEditorModal.css';

const getEventObject = (name: string, value: string) => ({
  target: { name, value },
});

interface props {
  isOpen: boolean;
  handleModalClose: () => void;
}

const RuleEditorModal: React.FC<props> = ({ isOpen, handleModalClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    ruleEditorModal: { props: ruleDetails },
  } = useSelector(getActiveModals);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const ruleConfig = RULE_TYPES_CONFIG[ruleDetails.ruleType];

  useEffect(() => {
    const defaultRuleDetails: Partial<Rule> = {
      name: `${ruleDetails.ruleType}_untitled`,
      description: `${ruleDetails.ruleType}_untitled`,
      status: Status.ACTIVE,
    };

    initiateBlankCurrentlySelectedRule(
      dispatch,
      currentlySelectedRuleConfig,
      ruleDetails.ruleType,
      setCurrentlySelectedRule,
      defaultRuleDetails
    );
    setCurrentlySelectedRuleConfig(dispatch, RULE_TYPES_CONFIG[ruleDetails.ruleType], navigate);

    return () => {
      dispatch(actions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [dispatch, currentlySelectedRuleConfig, ruleDetails.ruleType, navigate]);

  const handleRuleNameChange = useCallback(
    (name: Rule['name']) => {
      const event = getEventObject('name', name);
      onChangeHandler(currentlySelectedRuleData, dispatch, event);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const handleDescriptionChange = useCallback(
    (description: Rule['description']) => {
      const event = getEventObject('description', description);
      onChangeHandler(currentlySelectedRuleData, dispatch, event);
    },
    [dispatch, currentlySelectedRuleData]
  );

  return (
    <RQModal centered open={isOpen} width={'920px'} onCancel={handleModalClose} className="rule-editor-modal">
      <div className="rq-modal-content">
        <Row align="middle" justify="space-between" className="rule-editor-modal-header">
          <RQEditorTitle
            mode={'create'}
            name={currentlySelectedRuleData?.name ?? ''}
            nameChangeCallback={handleRuleNameChange}
            namePlaceholder="Enter rule name"
            description={currentlySelectedRuleData?.description ?? ''}
            descriptionChangeCallback={handleDescriptionChange}
            descriptionPlaceholder="Add description (optional)"
          />

          <CreateRuleButton location={location} isRuleEditorModal={true} />
        </Row>

        <div className="rule-editor-modal-container">
          <RulePairs mode="create" currentlySelectedRuleConfig={ruleConfig} />

          {ruleConfig.ALLOW_ADD_PAIR ? (
            <Row justify="end">
              <Col span={24}>
                <AddPairButton currentlySelectedRuleConfig={ruleConfig} />
              </Col>
            </Row>
          ) : null}
        </div>
      </div>
    </RQModal>
  );
};

export default RuleEditorModal;

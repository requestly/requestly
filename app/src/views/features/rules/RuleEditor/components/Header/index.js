import { useCallback, useEffect, useMemo } from "react";
import { Layout, Divider, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentlySelectedRuleConfig,
  getCurrentlySelectedRuleData,
  getGroupwiseRulesToPopulate,
} from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import Status from "./ActionButtons/Status";
import ActionButtons from "./ActionButtons";
import PinButton from "./ActionButtons/PinButton";
import EditorGroupDropdown from "./EditorGroupDropdown";
import { HelpButton } from "./ActionButtons/HelpButton";
import CloseButton from "./ActionButtons/CloseButton";
import { TestRuleButton } from "./ActionButtons/TestRuleButton";
import RuleOptions from "./RuleOptions";
// import { capitalize, replace } from "lodash";
import "./RuleEditorHeader.css";
import { WarningOutlined } from "@ant-design/icons";
import {
  checkIsRuleGroupDisabled,
  normalizeRecord,
} from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/utils/rules";
import { getAllRecordsMap } from "store/features/rules/selectors";
import { useRulesActionContext } from "features/rules/context/actions";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { trackSampleRuleCreateRuleClicked } from "features/rules/analytics";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import { getEventObject } from "components/common/RuleEditorModal/utils";
import { onChangeHandler } from "components/features/rules/RuleBuilder/Body/actions";

const Header = ({ mode, handleSeeLiveRuleDemoClick = () => {}, showEnableRuleTooltip = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const allRecordsMap = useSelector(getAllRecordsMap);

  const isSampleRule = currentlySelectedRuleData?.isSample;

  const { recordStatusToggleAction } = useRulesActionContext();

  // const getRuleTitle = (name, mode) => {
  //   return `${replace(capitalize(name), "api", "API")} / ${capitalize(mode)} ${
  //     mode === "create" ? "new rule" : "rule"
  //   }`;
  // };

  const isRuleGroupDisabled = useMemo(() => checkIsRuleGroupDisabled(allRecordsMap, currentlySelectedRuleData), [
    allRecordsMap,
    currentlySelectedRuleData,
  ]);

  // If user directly lands on rule editor, it ensures that
  // groupwise rules object is created for the current rule shown in the
  // editor, so that rule actions can be performed eg delete & export.
  useEffect(() => {
    // groupwise rules are already created
    if (Object.keys(groupwiseRulesToPopulate).length > 0) return;

    const groupwiseRule = {
      [currentlySelectedRuleData.groupId]: {
        group_rules: [{ ...currentlySelectedRuleData }],
      },
    };

    dispatch(globalActions.updateGroupwiseRulesToPopulate(groupwiseRule));
  }, [dispatch, currentlySelectedRuleData, groupwiseRulesToPopulate]);

  const handleRuleNameChange = useCallback(
    (name, warnForUnsavedChanges = true) => {
      const event = getEventObject("name", name);
      onChangeHandler(currentlySelectedRuleData, dispatch, event, warnForUnsavedChanges);
    },
    [dispatch, currentlySelectedRuleData]
  );

  return (
    <Layout.Header className="rule-editor-header" key={currentlySelectedRuleData.id}>
      <div className="rule-editor-row">
        <div className="rule-editor-title-info">
          <CloseButton mode={mode} ruleType={currentlySelectedRuleData?.ruleType} />
          <div className="text-gray rule-editor-header-title">
            {/* {getRuleTitle(currentlySelectedRuleConfig.NAME, mode)} */}

            <RQBreadcrumb
              disabled={isSampleRule}
              placeholder="Enter rule name"
              recordName={currentlySelectedRuleData?.name}
              onRecordNameUpdate={handleRuleNameChange}
            />
          </div>
        </div>

        {isSampleRule ? (
          <div className="ml-auto rule-editor-header-actions-container">
            <Status isSampleRule showEnableRuleTooltip={showEnableRuleTooltip} />

            {isRuleGroupDisabled && (
              <div className="rule-editor-header-disabled-group-warning">
                <Tooltip title="This rule won't execute because its parent group is disabled. Enable the group to run this rule.">
                  <WarningOutlined className="icon__wrapper" />
                  Group is disabled.{" "}
                  <RQButton
                    type="transparent"
                    size="small"
                    onClick={() =>
                      recordStatusToggleAction(normalizeRecord(allRecordsMap[currentlySelectedRuleData.groupId]))
                    }
                  >
                    Enable now
                  </RQButton>
                </Tooltip>
              </div>
            )}

            <Divider type="vertical" />

            <RQButton
              onClick={() => {
                trackSampleRuleCreateRuleClicked(currentlySelectedRuleData?.name, currentlySelectedRuleData?.ruleType);
                navigate(`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${currentlySelectedRuleData?.ruleType}`);
              }}
            >
              Create {currentlySelectedRuleConfig.NAME?.toLowerCase()} rule
            </RQButton>

            <RQButton type="primary" onClick={handleSeeLiveRuleDemoClick}>
              See live rule demo
            </RQButton>
          </div>
        ) : (
          <div className="ml-auto rule-editor-header-actions-container">
            <HelpButton />

            <Status mode={mode} />

            {isRuleGroupDisabled && (
              <div className="rule-editor-header-disabled-group-warning">
                <Tooltip title="This rule won't execute because its parent group is disabled. Enable the group to run this rule.">
                  <WarningOutlined className="icon__wrapper" />
                  Group is disabled.{" "}
                  <RQButton
                    type="transparent"
                    size="small"
                    onClick={() =>
                      recordStatusToggleAction(normalizeRecord(allRecordsMap[currentlySelectedRuleData.groupId]))
                    }
                  >
                    Enable now
                  </RQButton>
                </Tooltip>
              </div>
            )}

            <PinButton rule={currentlySelectedRuleData} />

            <Divider type="vertical" />

            <RuleOptions mode={mode} rule={currentlySelectedRuleData} />

            <EditorGroupDropdown mode={mode} />

            <TestRuleButton />

            <ActionButtons mode={mode} />
          </div>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;

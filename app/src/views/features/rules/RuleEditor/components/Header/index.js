import { useCallback, useEffect, useMemo, useState } from "react";
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
import { RBACButton, RoleBasedComponent, useRBAC } from "features/rbac";
import CreateRuleButton from "./ActionButtons/CreateRuleButton";
import { RULE_DETAILS } from "features/rules/screens/rulesList/components/RulesList/components/RuleSelectionList/constants";
import clientRuleStorageService from "services/clientStorageService/features/rule";
import { RecordType } from "@requestly/shared/types/entities/rules";
import { recordsActions } from "store/features/rules/slice";

const Header = ({ mode, handleSeeLiveRuleDemoClick = () => {}, showEnableRuleTooltip = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const allRecordsMap = useSelector(getAllRecordsMap);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const isSampleRule = currentlySelectedRuleData?.isSample;

  const { recordStatusToggleAction } = useRulesActionContext();

  const isRuleGroupDisabled = useMemo(() => checkIsRuleGroupDisabled(allRecordsMap, currentlySelectedRuleData), [
    allRecordsMap,
    currentlySelectedRuleData,
  ]);

  // handle the edge case scenario, when user reloads the page
  // Or lands directly, since the allRecordMap is Empty, so we need get the records
  // instead of this we can also use the useFetchAndUpdateRules hook
  useEffect(() => {
    const fetchGroupData = async () => {
      if (Object.keys(allRecordsMap).length === 0) {
        try {
          const groups = await clientRuleStorageService.getRecordsByObjectType(RecordType.GROUP);
          if (groups && groups.length > 0) {
            dispatch(recordsActions.setAllRecords(groups));
          }
        } catch (error) {
          console.error("Error fetching groups:", error);
        }
      }
    };

    fetchGroupData();
  }, [currentlySelectedRuleData?.groupId, allRecordsMap, dispatch]);

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

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: "Rules",
        pathname: PATHS.RULES.MY_RULES.ABSOLUTE,
        disabled: false,
      },
    ];

    // add group in breadcrumb if rule is in the group
    if (currentlySelectedRuleData?.groupId) {
      const group = allRecordsMap[currentlySelectedRuleData.groupId];
      if (group) {
        items.push({
          label: group.name,
          pathname: PATHS.RULES.MY_RULES.ABSOLUTE,
          disabled: false,
        });
      }
    }

    items.push({
      label: currentlySelectedRuleData?.name || "Rule",
      pathname: window.location.pathname,
      disabled: false,
      isEditable: true,
    });

    return items;
  }, [currentlySelectedRuleData, allRecordsMap]);

  const getRecordIcon = () => {
    if (!currentlySelectedRuleData?.ruleType) return null;

    for (const category of RULE_DETAILS.categories) {
      const matchedRule = category.rules.find((rule) => rule.type === currentlySelectedRuleData.ruleType);
      if (matchedRule) {
        return matchedRule.icon();
      }
    }
    return null;
  };

  return (
    <Layout.Header className="rule-editor-header" key={currentlySelectedRuleData.id}>
      <div className="rule-editor-row">
        <div className="rule-editor-title-info">
          <CloseButton mode={mode} ruleType={currentlySelectedRuleData?.ruleType} />
          <div className="text-gray rule-editor-header-title">
            <RQBreadcrumb
              disabled={isSampleRule || !isValidPermission}
              placeholder="Enter rule name"
              recordName={currentlySelectedRuleData?.name}
              recordIcon={getRecordIcon()}
              onRecordNameUpdate={handleRuleNameChange}
              defaultBreadcrumbs={breadcrumbItems}
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

            <RBACButton
              permission="create"
              resource="http_rule"
              tooltipTitle="Saving is not allowed in view-only mode. You can test rules but cannot save them."
              onClick={() => {
                trackSampleRuleCreateRuleClicked(currentlySelectedRuleData?.name, currentlySelectedRuleData?.ruleType);
                navigate(`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${currentlySelectedRuleData?.ruleType}`);
              }}
            >
              Create {currentlySelectedRuleConfig.NAME?.toLowerCase()} rule
            </RBACButton>

            <RQButton type="primary" onClick={handleSeeLiveRuleDemoClick}>
              See live rule demo
            </RQButton>
          </div>
        ) : (
          <div className="ml-auto rule-editor-header-actions-container">
            <RoleBasedComponent
              resource="http_rule"
              permission="create"
              fallback={
                <>
                  <HelpButton />
                  <Status mode={mode} />
                  <Divider type="vertical" />
                  <TestRuleButton />
                  <CreateRuleButton />
                </>
              }
            >
              <>
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
              </>
            </RoleBasedComponent>
          </div>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;

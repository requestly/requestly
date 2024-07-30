import React, { useState } from "react";
import { isRule } from "features/rules/utils";
import { RuleTableRecord } from "../../types";
import { Link } from "react-router-dom";
import { Button, Progress, Tooltip } from "antd";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { RuleSelectionListDrawer } from "../../../RuleSelectionListDrawer/RuleSelectionListDrawer";
import PATHS from "config/constants/sub/paths";
import { RecordStatus } from "features/rules/types/rules";
import { useTheme } from "styled-components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackNewRuleButtonClicked } from "modules/analytics/events/common/rules";
import { useDispatch } from "react-redux";
import { actions } from "store";

const RuleNameColumn: React.FC<{
  record: RuleTableRecord;
}> = ({ record }) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const [isRulesListDrawerOpen, setIsRulesListDrawerOpen] = useState(false);

  const onRulesListDrawerClose = () => {
    setIsRulesListDrawerOpen(false);
  };

  if (isRule(record)) {
    return (
      <div className="rule-name-container">
        <Link
          className="rule-name"
          state={{ source: "my_rules" }}
          to={`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${record.id}`}
          onClick={() => {
            //@ts-ignore
            dispatch(actions.updateSecondarySidebarCollapse(false));
          }}
        >
          {record.name}
        </Link>

        {record?.description ? (
          <Tooltip title={record?.description} placement="right" showArrow={false}>
            <span className="rule-description-icon">
              <RiInformationLine />
            </span>
          </Tooltip>
        ) : null}
      </div>
    );
  } else {
    const group = record;
    const totalRules = group.children?.length ?? 0;

    const activeRulesCount = (group.children || []).reduce((count, rule) => {
      return count + (rule.status === RecordStatus.ACTIVE ? 1 : 0);
    }, 0);

    return (
      <div className="group-name-container" key={record.id}>
        <div className="group-name">{group.name}</div>

        {totalRules > 0 ? (
          <Tooltip
            placement="top"
            title={
              <>
                <div>Active rules: {activeRulesCount}</div>
                <div>Total rules: {totalRules}</div>
              </>
            }
          >
            <div className="group-rules-count-details">
              <Progress
                strokeWidth={16}
                strokeColor={theme?.colors?.success}
                showInfo={false}
                type="circle"
                percent={(activeRulesCount / totalRules) * 100}
                size="small"
              />
              {activeRulesCount} / {totalRules}
            </div>
          </Tooltip>
        ) : null}

        <RuleSelectionListDrawer
          groupId={group.id}
          open={isRulesListDrawerOpen}
          onClose={onRulesListDrawerClose}
          source={SOURCE.RULE_GROUP}
        >
          <Button
            className="add-rule-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsRulesListDrawerOpen(true);
              trackNewRuleButtonClicked(SOURCE.RULE_GROUP);
            }}
          >
            <span>+</span> <span>Add rule</span>
          </Button>
        </RuleSelectionListDrawer>
      </div>
    );
  }
};

export default RuleNameColumn;

import { Typography } from "antd";
import React, { useMemo } from "react";
import { useRecords } from "../../contexts/RecordsContext";
import RuleItem from "../common/RuleItem";
import TabContentSection from "../common/TabContentSection";

const RecentRecords: React.FC = () => {
  const { rules } = useRecords();
  const recentRules = useMemo(
    () =>
      Object.values(rules)
        .sort((rule1, rule2) => rule2.modificationDate - rule1.modificationDate)
        .slice(0, 5),
    [rules]
  );

  return !recentRules.length ? (
    <div className="empty-pinned-rules-message">
      <Typography.Text italic type="secondary">
        No recent activity
      </Typography.Text>
    </div>
  ) : (
    <TabContentSection>
      <ul className="record-list">
        {recentRules.map((rule) => (
          <RuleItem key={rule.id} rule={rule} />
        ))}
      </ul>
    </TabContentSection>
  );
};

export default RecentRecords;

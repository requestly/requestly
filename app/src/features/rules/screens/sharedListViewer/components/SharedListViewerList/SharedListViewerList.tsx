import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getIsAppBannerVisible } from "store/selectors";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { RuleTableRecord } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/types";
import { useSharedListViewerColumns } from "./hooks/useSharedListViewerColumns";
import { SharedListViewerModal } from "../../modals/SharedListRuleViewerModal";
import { enhanceRecords } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/utils/rules";
import { recordsToContentTableDataAdapter } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/utils";
import "./sharedListViewerList.scss";
import { Group, Rule } from "@requestly/shared/types/entities/rules";

interface Props {
  records: Array<Rule | Group>;
  recordsMap: Record<string, Rule | Group>;
  isLoading: boolean;
}

export const SharedListViewerList: React.FC<Props> = ({ records, recordsMap, isLoading }) => {
  const [isSharedListViewerModalVisible, setIsSharedListViewerModalVisible] = useState(false);
  const [ruleToView, setRuleToView] = useState(null);
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);
  const [contentListTableData, setContentListTableData] = useState(null);

  const handleViewSharedListRule = (rule: RuleTableRecord) => {
    setRuleToView(rule);
    setIsSharedListViewerModalVisible(true);
  };
  const columns = useSharedListViewerColumns({ handleViewSharedListRule });

  useEffect(() => {
    // TODO: fix expected types in enhanceRecords function
    // @ts-ignore
    const enhancedRecords = enhanceRecords(records, recordsMap);
    const contentTableAdaptedRecords = recordsToContentTableDataAdapter(enhancedRecords);
    setContentListTableData(contentTableAdaptedRecords);
  }, [records, recordsMap, setContentListTableData]);

  return (
    <div className="shared-list-viewer-table-container">
      <ContentListTable
        columns={columns}
        data={contentListTableData}
        rowKey="id"
        id="shared-list-viewer-table"
        className="shared-list-viewer-table"
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Shared list found" />,
        }}
        loading={isLoading}
        scroll={isAppBannerVisible ? { y: "calc(100vh - 232px - 48px)" } : undefined}
        // 232px is the height of the content header + top header + footer, 48px is the height of the app banner
      />
      {isSharedListViewerModalVisible && (
        <SharedListViewerModal
          rule={ruleToView}
          isOpen={isSharedListViewerModalVisible}
          toggle={() => {
            setIsSharedListViewerModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

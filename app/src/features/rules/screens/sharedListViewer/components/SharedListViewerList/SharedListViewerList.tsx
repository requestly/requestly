import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getIsAppBannerVisible } from "store/selectors";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { RuleTableRecord } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/types";
import { useSharedListViewerColumns } from "./hooks/useSharedListViewerColumns";
import { SharedListViewerModal } from "../../modals/SharedListRuleViewerModal";
import "./sharedListViewerList.scss";

interface Props {
  records: RuleTableRecord[];
  isLoading: boolean;
}

export const SharedListViewerList: React.FC<Props> = ({ records, isLoading }) => {
  const [isSharedListViewerModalVisible, setIsSharedListViewerModalVisible] = useState(false);
  const [ruleToView, setRuleToView] = useState(null);
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);

  const handleViewSharedListRule = (rule: RuleTableRecord) => {
    setRuleToView(rule);
    setIsSharedListViewerModalVisible(true);
  };
  const columns = useSharedListViewerColumns({ handleViewSharedListRule });

  return (
    <>
      <ContentListTable
        columns={columns}
        data={records}
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
    </>
  );
};

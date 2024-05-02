import React from "react";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { RuleTableRecord } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/types";
import { useSharedListViewerColumns } from "./hooks/useSharedListViewerColumns";
import "./sharedListViewerList.scss";

interface Props {
  records: RuleTableRecord[];
  isLoading: boolean;
}

export const SharedListViewerList: React.FC<Props> = ({ records, isLoading }) => {
  const columns = useSharedListViewerColumns();

  return (
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
    />
  );
};

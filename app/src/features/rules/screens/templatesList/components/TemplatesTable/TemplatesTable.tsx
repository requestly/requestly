import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import { Empty } from "antd";
import templateRecords from "./constants/templates";
import useTemplatesTableColumns from "./hooks/useTemplatesTableColumns";
import React, { useMemo, useState } from "react";
import { TemplatePreviewModal } from "../../modals/TemplatePreviewModal/TemplatePreviewModal";
import { TemplateRecord } from "./types";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./templatesTable.scss";

interface TemplatesTableProps {
  searchValue: string;
}
const TemplatesTable: React.FC<TemplatesTableProps> = ({ searchValue }) => {
  const [isTemplatePreviewModalVisible, setIsTemplatePreviewModalVisible] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState(null);

  const handlePreviewTemplateInModal = (template: TemplateRecord) => {
    setTemplateToPreview(template.data);
    setIsTemplatePreviewModalVisible(true);
  };

  const filteredRecords = useMemo(() => {
    return templateRecords.filter((record) => {
      return record.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [searchValue]);

  const tableColumns = useTemplatesTableColumns({ handlePreviewTemplateInModal });

  return (
    <>
      {isTemplatePreviewModalVisible && (
        <TemplatePreviewModal
          rule={templateToPreview}
          isOpen={isTemplatePreviewModalVisible}
          toggle={() => setIsTemplatePreviewModalVisible(false)}
          source={SOURCE.TEMPLATES_SCREEN}
        />
      )}
      <div className="rq-templates-table">
        <ContentListTable
          id="templates-list-table"
          size="small"
          columns={tableColumns}
          data={filteredRecords}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Templates found" />,
          }}
          scroll={{ y: `calc(100vh - 232px)` }}
        />
      </div>
    </>
  );
};

export default withContentListTableContext(TemplatesTable);

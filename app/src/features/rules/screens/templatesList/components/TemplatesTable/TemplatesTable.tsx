import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import { Empty } from "antd";
import templateRecords from "./constants/templates";
import useTemplatesTableColumns from "./hooks/useTemplatesTableColumns";
import { useState } from "react";
import { TemplatePreviewModal } from "../../modals/TemplatePreviewModal/TemplatePreviewModal";
import { TemplateRecord } from "./types";
import "./templatesTable.scss";

const TemplatesTable = () => {
  const [isTemplatePreviewModalVisible, setIsTemplatePreviewModalVisible] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState(null);

  const handlePreviewTemplateInModal = (template: TemplateRecord) => {
    setTemplateToPreview(template.data);
    setIsTemplatePreviewModalVisible(true);
  };

  const tableColumns = useTemplatesTableColumns({ handlePreviewTemplateInModal });

  return (
    <>
      {isTemplatePreviewModalVisible && (
        <TemplatePreviewModal
          rule={templateToPreview}
          isOpen={isTemplatePreviewModalVisible}
          toggle={() => setIsTemplatePreviewModalVisible(false)}
          source="templates_screen"
        />
      )}
      <div className="rq-templates-table">
        <ContentListTable
          id="templates-list-table"
          size="large"
          columns={tableColumns}
          data={templateRecords}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Templates found" />,
          }}
          disableRowSelection
          scroll={{ y: `calc(100vh - 210px)` }}
        />
      </div>
    </>
  );
};

export default withContentListTableContext(TemplatesTable);

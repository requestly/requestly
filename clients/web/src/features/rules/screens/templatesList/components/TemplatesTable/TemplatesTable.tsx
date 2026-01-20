import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import { Empty } from "antd";
import templateRecords from "./constants/templates";
import useTemplatesTableColumns from "./hooks/useTemplatesTableColumns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TemplatePreviewModal } from "../../modals/TemplatePreviewModal/TemplatePreviewModal";
import { TemplateRecord } from "./types";
import { SOURCE } from "modules/analytics/events/common/constants";
import { useSelector } from "react-redux";
import { getIsAppBannerVisible } from "store/selectors";
import { useNavigate, useSearchParams } from "react-router-dom";
import { trackTemplateImportStarted } from "../../analytics";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
import "./templatesTable.scss";

interface TemplatesTableProps {
  searchValue: string;
}
const TemplatesTable: React.FC<TemplatesTableProps> = ({ searchValue }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isTemplatePreviewModalVisible, setIsTemplatePreviewModalVisible] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState(null);
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);
  const templateId = searchParams.get("id");

  const filteredRecords = useMemo(() => {
    return templateRecords.filter((record) => {
      return record.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [searchValue]);

  const handlePreviewTemplate = useCallback(
    (template: TemplateRecord) => {
      trackTemplateImportStarted(template.name, SOURCE.TEMPLATES_SCREEN);
      if (template.isSharedList) {
        redirectToSharedListViewer(navigate, template.data.shareId, template.data.sharedListName, true);
      } else {
        setTemplateToPreview(template.data);
        setIsTemplatePreviewModalVisible(true);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!templateId) {
      return;
    }
    const template = filteredRecords.find((template) => template.id === templateId);

    if (template) {
      handlePreviewTemplate(template);
    }
  }, [templateId, filteredRecords, handlePreviewTemplate]);

  const tableColumns = useTemplatesTableColumns({ handlePreviewTemplate });

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
          scroll={isAppBannerVisible ? { y: "calc(100vh - 232px - 48px)" } : undefined}
          // 232px is the height of the content header + top header + footer, 48px is the height of the app banner
        />
      </div>
    </>
  );
};

export default withContentListTableContext(TemplatesTable);

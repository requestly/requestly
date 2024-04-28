import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table } from "antd";
import RuleTypeTag from "components/common/RuleTypeTag";
import { ContentListTableProps } from "componentsV2/ContentList";
import { TemplateRecord } from "../types";
import { redirectToSharedListViewer } from "utils/RedirectionUtils";
import { trackTemplateImportStarted } from "../../../analytics";
import { SOURCE } from "modules/analytics/events/common/constants";

interface Props {
  handlePreviewTemplateInModal: (template: TemplateRecord) => void;
}

const useTemplatesTableColumns: (props: Props) => ContentListTableProps<TemplateRecord>["columns"] = ({
  handlePreviewTemplateInModal,
}) => {
  const navigate = useNavigate();

  const handlePreviewTemplate = useCallback(
    (template: TemplateRecord) => {
      trackTemplateImportStarted(template.name, SOURCE.TEMPLATES_SCREEN);
      if (template.isSharedList) {
        redirectToSharedListViewer(navigate, template.data.shareId, template.data.sharedListName, true);
      } else {
        handlePreviewTemplateInModal(template);
      }
    },
    [navigate, handlePreviewTemplateInModal]
  );

  const columns: ContentListTableProps<TemplateRecord>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      key: "name",
      width: 320,
      render: (_: any, record: TemplateRecord) => {
        let ruleTypes: string[] = [];

        if (record.tags?.length) {
          ruleTypes = record.tags;
        } else if (!record.isSharedList) {
          ruleTypes = [record.data.ruleDefinition.ruleType];
        }
        return (
          <>
            <div className="template-name" onClick={() => handlePreviewTemplate(record)}>
              {record.name}
            </div>
            <div className="template-rule-tags">
              {ruleTypes.map((ruleType, index) => (
                <RuleTypeTag ruleType={ruleType} title={ruleType.toUpperCase()} />
              ))}
            </div>
          </>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 420,
      render: (description: string) => <div className="template-description">{description}</div>,
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_: any, record: TemplateRecord) => {
        return (
          <div className="templates-actions-container">
            <Button type="default" onClick={() => handlePreviewTemplate(record)}>
              Use this
            </Button>
          </div>
        );
      },
    },
  ];

  return columns;
};

export default useTemplatesTableColumns;

import { Row, Table } from "antd";
import RuleTypeTag from "components/common/RuleTypeTag";
import { ContentListTableProps } from "componentsV2/ContentList";
import { RuleTableRecord } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/types";
import { isRule } from "features/rules/utils";
import { RQButton } from "lib/design-system/components";
import moment from "moment";

interface Props {
  handleViewSharedListRule: (rule: RuleTableRecord) => void;
}

export const useSharedListViewerColumns = ({ handleViewSharedListRule }: Props) => {
  const columns: ContentListTableProps<RuleTableRecord>["columns"] = [
    Table.EXPAND_COLUMN,
    {
      title: "Rule Details",
      width: 500,
      render: (_: any, record: RuleTableRecord) => (
        <div
          className={`shared-list-viewer-record-name ${isRule(record) ? "shared-list-viewer-rule-name" : ""}`}
          onClick={() => handleViewSharedListRule(record)}
        >
          {record.name}
        </div>
      ),
    },
    {
      title: "Type",
      width: 300,
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          return <RuleTypeTag ruleType={record.ruleType} />;
        } else return null;
      },
    },
    {
      title: "Last Modified",
      width: 300,
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          const beautifiedDate = moment(record.modificationDate).format("MMM DD, YYYY");

          return <div>{beautifiedDate}</div>;
        } else return null;
      },
    },
    {
      title: "",
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          return (
            <Row justify="end">
              <RQButton
                type="default"
                className="view-shared-list-rule-btn"
                onClick={() => handleViewSharedListRule(record)}
              >
                View
              </RQButton>
            </Row>
          );
        }
      },
    },
  ];

  return columns;
};

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
      width: 400,
      render: (_: any, record: RuleTableRecord) => (
        <div className={`shared-list-viewer-record-name ${isRule(record) ? "shared-list-viewer-rule-name" : ""}`}>
          {record.name}
        </div>
      ),
    },
    {
      title: "Type",
      width: 200,
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          return (
            <div className="text-center">
              <RuleTypeTag ruleType={record.ruleType} />
            </div>
          );
        } else return null;
      },
    },
    {
      title: "Last Modified",
      width: 200,
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          const beautifiedDate = moment(record.modificationDate).format("MMM DD, YYYY");

          return <div className="text-center">{beautifiedDate}</div>;
        } else return null;
      },
    },
    {
      title: "",
      render: (_: any, record: RuleTableRecord) => {
        if (isRule(record)) {
          return (
            <Row justify="end">
              <RQButton type="default" onClick={() => handleViewSharedListRule(record)}>
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

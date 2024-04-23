import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import { Empty } from "antd";
import templateRecords from "./constants/templates";
import useTemplatesTableColumns from "./hooks/useTemplatesTableColumns";
import "./templatesTable.scss";

const TemplatesTable = () => {
  const tableColumns = useTemplatesTableColumns();

  return (
    <>
      <ContentListTable
        id="templates-list-table"
        size="large"
        columns={tableColumns}
        data={templateRecords}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Templates found" />,
        }}
      />
    </>
  );
};

export default withContentListTableContext(TemplatesTable);

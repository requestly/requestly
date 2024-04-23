import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import { Empty } from "antd";
import templateRecords from "./constants/templates";
import useTemplatesTableColumns from "./hooks/useTemplatesTableColumns";
import "./templatesTable.scss";

const TemplatesTable = () => {
  const tableColumns = useTemplatesTableColumns();

  return (
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
  );
};

export default withContentListTableContext(TemplatesTable);

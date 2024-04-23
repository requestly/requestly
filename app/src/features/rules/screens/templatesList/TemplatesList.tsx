import { Typography } from "antd";
import TemplatesTable from "./components/TemplatesTable/TemplatesTable";
import "./templatesList.css";

export const TemplatesList = () => {
  return (
    <>
      <div className="templates-list-screen">
        <Typography.Title level={3} className="templates-list-title">
          Templates
        </Typography.Title>
      </div>
      <div className="rq-templates-table">
        <TemplatesTable />
      </div>
    </>
  );
};

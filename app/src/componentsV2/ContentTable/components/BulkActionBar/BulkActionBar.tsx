import { Button, Col, Row } from "antd";
import { BulkActionBarConfig } from "../../types";
import "./bulkActionBar.scss";

export interface Props<DataType> {
  config: BulkActionBarConfig;
  selectedRows: DataType[]; // FIXME: Add proper data type here
  clearSelectedRowsData: () => void;
}

// Contains common design and colors for app
const BulkActionBar = <DataType,>({ config, selectedRows, clearSelectedRowsData }: Props<DataType>) => {
  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <div className="bulk-action-bar-container">
      <Row justify={"space-evenly"}>
        <Col span={8}>
          {typeof config.options.infoText === "function"
            ? config.options?.infoText(selectedRows)
            : config.options.infoText}
        </Col>
        {config.options.actions.map((actionConfig) => {
          return (
            <Col>
              <Button
                danger={actionConfig.danger ?? false}
                type={actionConfig.actionType ?? "default"}
                onClick={() => {
                  actionConfig?.onClick(selectedRows);
                  clearSelectedRowsData();
                }}
              >
                {typeof actionConfig.label === "function" ? actionConfig.label(selectedRows) : actionConfig.label}
              </Button>
            </Col>
          );
        })}
        <Col>
          <Button type="default">Cancel</Button>
        </Col>
      </Row>
    </div>
  );
};

export default BulkActionBar;

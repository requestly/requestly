import { Button, Col, Row } from "antd";
import { BulkActionBarConfig } from "../../types";

import "./bulkActionBar.scss";

export interface Props<DataType> {
  config: BulkActionBarConfig;
  selectedRows: DataType[]; // FIXME: Add proper data type here
}

// Contains common design and colors for app
const BulkActionBar = <DataType,>({ config, selectedRows }: Props<DataType>) => {
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
              <Button onClick={() => actionConfig?.onClick(selectedRows)}>
                {typeof actionConfig.text === "function" ? actionConfig.text(selectedRows) : actionConfig.text}
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

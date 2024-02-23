import { Button } from "antd";
import { BulkActionBarConfig } from "../../types";
import { RiCloseLine } from "@react-icons/all-files/ri/RiCloseLine";
import "./bulkActionBar.scss";

export interface Props<DataType> {
  config: BulkActionBarConfig<DataType>;
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
      <div className="info-text">
        {typeof config.options.infoText === "function"
          ? config.options?.infoText(selectedRows)
          : config.options.infoText}
      </div>

      <div className="action-btns">
        {config.options.actions.map((actionConfig, index) => {
          if (actionConfig.isActionHidden?.(selectedRows)) return null;
          return (
            <Button
              key={index}
              className="action-btn"
              icon={actionConfig.icon ?? null}
              danger={actionConfig.danger ?? false}
              type={actionConfig.type ?? "default"}
              disabled={actionConfig.disabled ?? false}
              onClick={() => {
                actionConfig?.onClick(selectedRows, clearSelectedRowsData);
              }}
            >
              {typeof actionConfig.label === "function" ? actionConfig.label(selectedRows) : actionConfig.label}
            </Button>
          );
        })}
      </div>

      <Button type="text" icon={<RiCloseLine />} className="cancel-btn action-btn" onClick={clearSelectedRowsData}>
        Cancel
      </Button>
    </div>
  );
};

export default BulkActionBar;

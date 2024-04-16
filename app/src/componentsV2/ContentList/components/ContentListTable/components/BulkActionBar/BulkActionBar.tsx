import { Button } from "antd";
import { BulkActionBarConfig } from "../../types";
import { RiCloseLine } from "@react-icons/all-files/ri/RiCloseLine";
import "./bulkActionBar.scss";
import { useContentListTableContext } from "../../context";

export interface Props<DataType> {
  config: BulkActionBarConfig<DataType>;
  selectedRows: DataType[]; // FIXME: Add proper data type here
}

const BulkActionBar = <DataType,>({ config, selectedRows }: Props<DataType>) => {
  const { clearSelectedRows } = useContentListTableContext();

  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <div className="rq-bulk-action-bar-container">
      <div className="rq-bulk-action-bar-info-text">
        {typeof config.options.infoText === "function"
          ? config.options?.infoText(selectedRows)
          : config.options.infoText}
      </div>

      <div className="rq-bulk-action-bar-action-btn-container">
        {config.options.actionButtons.map((btnConfig, index) => {
          if (
            (typeof btnConfig.hidden === "boolean" && btnConfig.hidden) ||
            (typeof btnConfig.hidden === "function" && btnConfig.hidden?.(selectedRows))
          )
            return null;

          return (
            <Button
              key={index}
              className="rq-bulk-action-bar-action-btn"
              loading={btnConfig.loading ?? false}
              icon={btnConfig.icon ?? null}
              danger={btnConfig.danger ?? false}
              type={btnConfig.type ?? "default"}
              disabled={btnConfig.disabled ?? false}
              onClick={() => {
                btnConfig?.onClick(selectedRows);
              }}
            >
              {typeof btnConfig.label === "function" ? btnConfig.label(selectedRows) : btnConfig.label}
            </Button>
          );
        })}
        <Button
          type="text"
          icon={<RiCloseLine />}
          className="rq-bulk-action-bar-action-btn rq-bulk-action-bar-cancel-btn"
          onClick={clearSelectedRows}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;

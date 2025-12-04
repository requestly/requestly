import React from "react";
import { Input, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { BiSelectMultiple } from "@react-icons/all-files/bi/BiSelectMultiple";
import { NewApiRecordDropdown, NewRecordDropdownItemType } from "../NewApiRecordDropdown/NewApiRecordDropdown";
import { RQAPI } from "features/apiClient/types";
import "./sidebarListHeader.scss";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { ApiClientSidebarTabKey } from "../../SingleWorkspaceSidebar/SingleWorkspaceSidebar";

interface ListHeaderProps {
  onSearch: (value: string) => void;
  newRecordActionOptions: {
    showNewRecordAction: boolean;
    onNewRecordClick: (
      analyticEventSource: RQAPI.AnalyticsEventSource,
      recordType: RQAPI.RecordType,
      collectionId?: string,
      entryType?: RQAPI.ApiEntryType
    ) => Promise<void>;
  };
  multiSelectOptions?: {
    showMultiSelect: boolean;
    toggleMultiSelect: () => void;
  };
  listType?: ApiClientSidebarTabKey;
}

export const SidebarListHeader: React.FC<ListHeaderProps> = ({
  onSearch,
  multiSelectOptions,
  newRecordActionOptions,
  listType,
}) => {
  const { showMultiSelect = false, toggleMultiSelect } = multiSelectOptions || {};
  const { showNewRecordAction, onNewRecordClick } = newRecordActionOptions || {};

  return (
    <div className="sidebar-list-header">
      {showMultiSelect && (
        <div className="multi-select-option">
          <Tooltip title={"Select items"}>
            <RQButton size="small" type="transparent" icon={<BiSelectMultiple />} onClick={toggleMultiSelect} />
          </Tooltip>
        </div>
      )}
      <Input
        size="small"
        prefix={<SearchOutlined />}
        placeholder="Search"
        onChange={(e) => onSearch(e.target.value)}
        className="sidebar-list-header-search"
      />

      {listType ? (
        listType === ApiClientSidebarTabKey.ENVIRONMENTS ? (
          <RQTooltip title="New Environment">
            <RQButton
              size="small"
              type="transparent"
              icon={<MdAdd />}
              className="sidebar-list-header-button"
              onClick={() => {
                onNewRecordClick("api_client_sidebar_header", RQAPI.RecordType.ENVIRONMENT);
              }}
            />
          </RQTooltip>
        ) : null
      ) : (
        showNewRecordAction && (
          <NewApiRecordDropdown
            invalidActions={[NewRecordDropdownItemType.ENVIRONMENT]}
            onSelect={(params) => {
              onNewRecordClick("api_client_sidebar_header", params.recordType, undefined, params.entryType);
            }}
          >
            <RQTooltip title="New Request or Collection">
              <RQButton size="small" type="transparent" icon={<MdAdd />} className="sidebar-list-header-button" />
            </RQTooltip>
          </NewApiRecordDropdown>
        )
      )}
    </div>
  );
};

import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import { PicRightOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import { actions } from "store";
import "./sharedListsContentHeader.scss";

interface SharedListsContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const SharedListsContentHeader: React.FC<SharedListsContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  const dispatch = useDispatch();
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  const handleSecondarySidebarToggle = (e: React.MouseEvent) => {
    // @ts-ignore
    dispatch(actions.updateSecondarySidebarCollapse(!isSecondarySidebarCollapsed));
    trackFooterClicked("secondary_sidebar_toggle_from_shared_list");
  };

  return (
    <div className="sharedlist-table-header">
      <div className="sharedlist-table-breadcrumb">
        {/* TODO: this is temp fix */}
        <Tooltip title={`${isSecondarySidebarCollapsed ? "Expand" : "Collapse"} sidebar`} placement="bottom">
          <Button
            type="text"
            icon={<PicRightOutlined />}
            className="sidebar-toggle-btn"
            onClick={handleSecondarySidebarToggle}
          />
        </Tooltip>

        <div>
          <span className="breadcrumb-1">Rules</span> {" > "} <span className="breadcrumb-2">Shared lists</span>
        </div>
      </div>
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </div>
  );
};

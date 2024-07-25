import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import "./templatesTableContentHeader.scss";
import { useDispatch, useSelector } from "react-redux";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import { actions } from "store";
import { Button, Tooltip } from "antd";
import { PicRightOutlined } from "@ant-design/icons";

interface TemplatesTableContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const TemplatesTableContentHeader: React.FC<TemplatesTableContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  const dispatch = useDispatch();
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);

  const handleSecondarySidebarToggle = (e: React.MouseEvent) => {
    // @ts-ignore
    dispatch(actions.updateSecondarySidebarCollapse(!isSecondarySidebarCollapsed));
    trackFooterClicked("secondary_sidebar_toggle_from_template");
  };

  return (
    <>
      <div className="templates-table-breadcrumb">
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
          <span className="breadcrumb-1">Rules</span> {" > "} <span className="breadcrumb-2">Templates</span>
        </div>
      </div>
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </>
  );
};

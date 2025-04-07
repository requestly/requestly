import React from "react";
import { useTabsLayoutContext } from "layouts/TabsLayout/contexts";
import { Tabs, TabsProps } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RQButton } from "lib/design-system-v2/components";
import { getTabIconFromUrl } from "./utils";
import "./tabsLayoutContent.scss";

interface Props {
  Outlet: (props: any) => React.ReactElement;
}

export const TabsLayoutContent: React.FC<Props> = ({ Outlet }) => {
  const { tabs, activeTab, switchToTab, closeTab, updateTab, onTabsEdit } = useTabsLayoutContext();

  const items: TabsProps["items"] = tabs.map((tab) => {
    const tabIcon = getTabIconFromUrl(tab.url);

    return {
      key: tab.id,
      closable: false,
      label: (
        <div
          title={tab.title}
          className="tab-title-container"
          onDoubleClick={() => {
            if (tab.isPreview) {
              updateTab(tab.id, { isPreview: false });
            }
          }}
        >
          <div className="tab-title">
            {tabIcon ? <div className="icon">{tabIcon}</div> : null}
            <div className="title">{tab.isPreview ? <i>{tab.title}</i> : tab.title}</div>
          </div>

          <div className="tab-actions">
            <RQButton
              size="small"
              type="transparent"
              className="tab-close-button"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              icon={<MdClose />}
            />
            {tab.hasUnsavedChanges ? <div className="unsaved-changes-indicator" /> : null}
          </div>
        </div>
      ),
      children: <Outlet key={tab.id} context={{ tab }} />,
    };
  });

  return (
    <div className="tabs-layout-container">
      {tabs.length ? (
        <Tabs
          type="editable-card"
          activeKey={activeTab?.id}
          destroyInactiveTabPane={false}
          className="tabs-layout-tabs-container"
          popupClassName="tabs-layout-more-dropdown"
          items={items}
          onEdit={onTabsEdit}
          onChange={(activeTabId) => {
            switchToTab(activeTabId);
          }}
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

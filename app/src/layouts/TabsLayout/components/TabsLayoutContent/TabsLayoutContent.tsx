import React from "react";
import { useTabsLayoutContext } from "layouts/TabsLayout/contexts";
import { Tabs, TabsProps } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RQButton } from "lib/design-system-v2/components";
import { unstable_useBlocker } from "react-router-dom";
import { getTabIconFromUrl } from "./utils";
import "./tabsLayoutContent.scss";

interface Props {
  Outlet: (props: any) => React.ReactElement;
}

export const TabsLayoutContent: React.FC<Props> = ({ Outlet }) => {
  const { tabs, activeTab, openTab, closeTab, onTabsEdit } = useTabsLayoutContext();

  const hasUnsavedChanges = tabs.some((tab) => tab.hasUnsavedChanges);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
    const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;

    if (isNextLocationApiClientView) {
      return false;
    }

    if (shouldBlock) {
      const shouldDiscardChanges = window.confirm("Discard changes? Changes you made will not be saved.");
      const blockNavigation = !shouldDiscardChanges;
      return blockNavigation;
    }

    return false;
  });

  const items: TabsProps["items"] = tabs.map((tab) => {
    const tabIcon = getTabIconFromUrl(tab.url);

    return {
      key: tab.id,
      closable: false,
      label: (
        <div title={tab.title} className="tab-title-container">
          <div className="tab-title">
            {tabIcon ? <div className="icon">{tabIcon}</div> : null}
            <div className="title">{tab.title}</div>
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
            openTab(activeTabId);
          }}
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

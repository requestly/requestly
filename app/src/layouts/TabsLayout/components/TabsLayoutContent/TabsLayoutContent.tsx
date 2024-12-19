import React from "react";
import { useTabsLayoutContext } from "layouts/TabsLayout/contexts";
import { Tabs, TabsProps } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RQButton } from "lib/design-system-v2/components";
import "./tabsLayoutContent.scss";
import { unstable_useBlocker } from "react-router-dom";

interface Props {
  Outlet: (props: any) => React.ReactElement;
}

export const TabsLayoutContent: React.FC<Props> = ({ Outlet }) => {
  const { tabs, activeTab, openTab, closeTab } = useTabsLayoutContext();

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
    return {
      key: tab.id,
      label: (
        <div title={tab.title} className="tab-title-container">
          <div className="tab-title">{tab.title}</div>

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
          hideAdd
          activeKey={activeTab?.id}
          destroyInactiveTabPane={false}
          className="tabs-layout-tabs-container"
          popupClassName="tabs-layout-more-dropdown"
          items={items}
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

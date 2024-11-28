import React from "react";
import { useTabsLayoutContext } from "layouts/TabsLayout/contexts";
import { Outlet, OutletProps } from "react-router-dom";
import { Tabs, TabsProps } from "antd";
import "./tabsLayoutContent.scss";
// import { RQButton } from "lib/design-system-v2/components";

export const TabsLayoutContent: React.FC = () => {
  const { tabs, activeTab, openTab } = useTabsLayoutContext();

  /**
   * - Do the processing here for rendering the current tabs and all the multiple tabs
   */
  const context: OutletProps["context"] = {};

  // Test performance, data loss, lag???
  const items: TabsProps["items"] = tabs.map((tabDetails) => {
    const clonedOutlet = React.cloneElement(<Outlet />, { context });

    return {
      key: tabDetails.id,
      label: (
        <div>
          {tabDetails.title}{" "}
          {/* <RQButton
            size="small"
            onClick={() => {
              closeTab();
            }}
          >
            x
          </RQButton> */}
        </div>
      ),
      children: clonedOutlet,
    };
  });

  // return <Outlet />;

  return (
    <div className="tabs-layout-container">
      {tabs.length ? (
        <Tabs
          activeKey={activeTab?.id}
          // destroyInactiveTabPane={false}
          items={items}
          onChange={(activeTab) => {
            openTab(activeTab);
          }}
        />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

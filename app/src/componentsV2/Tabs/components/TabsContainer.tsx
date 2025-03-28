import React, { useEffect, useMemo, useRef } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { useSetUrl } from "../tabUtils";
import { Outlet } from "react-router-dom";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./tabsContainer.scss";

export const TabsContainer: React.FC = () => {
  const [
    activeTabId,
    setActiveTabId,
    tabs,
    _version,
    openTab,
    closeTabById,
    getSourceByTabId,
    incrementVersion,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.setActiveTabId,
    state.tabs,
    state._version,
    state.openTab,
    state.closeTabById,
    state.getSourceByTabId,
    state.incrementVersion,
  ]);

  const isInitialLoadRef = useRef(true);
  const matchedTabSource = useMatchedTabSource();
  const { setUrl } = useSetUrl();

  useEffect(() => {
    if (!matchedTabSource) {
      return;
    }

    openTab(matchedTabSource.sourceFactory(matchedTabSource.matchedPath));
  }, [matchedTabSource, openTab]);

  useEffect(() => {
    if (activeTabId) {
      const tabSource = getSourceByTabId(activeTabId);
      const newPath = tabSource.getUrlPath();
      setUrl(newPath, isInitialLoadRef.current);
    }

    if (activeTabId && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [activeTabId, getSourceByTabId, setUrl]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    return Array.from(tabs.values()).map((tabStore) => {
      const tabState = tabStore.getState();
      return {
        key: tabState.id.toString(),
        closable: false,
        label: (
          <div
            title={tabState.title}
            className="tab-title-container"
            onDoubleClick={() => {
              if (tabState.preview) {
                tabState.setPreview(false);
                incrementVersion();
              }
            }}
          >
            <div className="tab-title">
              {<div className="icon">{tabState.source.getIcon()}</div>}
              <div className="title">{tabState.preview ? <i>{tabState.title}</i> : tabState.title}</div>
            </div>

            <div className="tab-actions">
              <RQButton
                size="small"
                type="transparent"
                className="tab-close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTabById(tabState.id);
                }}
                icon={<MdClose />}
              />
              {tabState.saved ? <div className="unsaved-changes-indicator" /> : null}
            </div>
          </div>
        ),
        children: <TabItem store={tabStore}>{tabState.source.render()}</TabItem>,
      };
    });
    // We need _version in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, _version]);

  return tabItems.length === 0 ? (
    <Outlet />
  ) : (
    <div className="tabs-container">
      <Tabs
        type="editable-card"
        items={tabItems}
        activeKey={activeTabId.toString()}
        className="tabs-content"
        popupClassName="tabs-content-more-dropdown"
        onChange={(key) => {
          setActiveTabId(parseInt(key));
        }}
        onEdit={(key, action) => {
          if (action === "remove") {
            const id = parseInt(key as string);
            closeTabById(id);
          } else if (action === "add") {
            openTab(new DraftRequestContainerTabSource());
          }
        }}
      />
    </div>
  );
};

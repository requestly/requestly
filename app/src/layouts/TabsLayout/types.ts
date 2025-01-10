import React from "react";
import { TabsProps } from "antd";

export namespace TabsLayout {
  // TODO: add icon type or record type?
  export interface Tab {
    id: string;

    /**
     * Page Url
     */
    url: string;

    /**
     * Tab title
     */
    title: string;
    hasUnsavedChanges: boolean;

    /**
     * If true, indicates a preview tab
     */
    isPreview?: boolean;
    timeStamp: number;
  }

  export enum IconType {
    REQUEST = "request",
    COLLECTION = "collection",
    ENVIORNMENT_VARIABLE = "environment_variable",
  }
}

export interface TabsLayoutContextInterface {
  tabs: TabsLayout.Tab[];
  activeTab: TabsLayout.Tab;
  closeTab: (tabId: TabsLayout.Tab["id"]) => void;
  deleteTabs: (tabIds: TabsLayout.Tab["id"][]) => void;
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => void;
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => void;
  replaceTab: (tabId: TabsLayout.Tab["id"], newTabData?: Partial<TabsLayout.Tab>) => void;
  onTabsEdit: TabsProps["onEdit"];
  updateAddTabBtnCallback: (cb: () => void) => void;
  tabOutletElementsMap: React.RefObject<{ [tabId: string]: React.ReactElement }>;
}

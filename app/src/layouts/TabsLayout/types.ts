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
    timeStamp: number;
  }
}

export interface TabsLayoutContextInterface {
  tabs: TabsLayout.Tab[];
  activeTab: TabsLayout.Tab;
  closeTab: (tabId: TabsLayout.Tab["id"]) => void;
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => void;
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => void;
}

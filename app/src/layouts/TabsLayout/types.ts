export namespace TabsLayout {
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

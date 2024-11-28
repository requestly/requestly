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

  /**
   * If changes for this tab is saved once, then persist this tab between reloads
   */
  isSaved: boolean;
  hasUnsavedChanges: boolean;
  timeStamp: number;
}

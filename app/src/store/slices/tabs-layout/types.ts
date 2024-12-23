import { TabsLayout } from "layouts/TabsLayout";

export type TabsLayoutState = Record<
  string,
  {
    tabs: TabsLayout.Tab[];
    activeTab: TabsLayout.Tab | null;
  }
>;

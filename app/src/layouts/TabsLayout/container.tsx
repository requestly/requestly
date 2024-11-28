import React from "react";
import { TabsLayoutProvider } from "./contexts";
import { TabsLayoutContent } from "./components";

export const TabsLayoutContainer: React.FC = () => {
  return (
    <TabsLayoutProvider>
      {/* TabsLayoutHeader */}
      <TabsLayoutContent />
    </TabsLayoutProvider>
  );
};

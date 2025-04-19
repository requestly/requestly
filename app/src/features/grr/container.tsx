import React from "react";
import { GrrWarningScreen } from "./screens/GrrWarningScreen";
import MinimalLayout from "layouts/MinimalLayout";

export const GrrWarningScreenContainer: React.FC = () => {
  return (
    <MinimalLayout>
      <GrrWarningScreen />
    </MinimalLayout>
  );
};

import { VariablesListView } from "./components/VariablesListView/VariableListView";
import "./environments.css";

export const Environments = () => {
  return (
    <div className="environments-view-container">
      {/* TEMP: SIDEBAR */}
      <div
        style={{
          width: "280px",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        SIDEBAR
      </div>
      <VariablesListView />
    </div>
  );
};

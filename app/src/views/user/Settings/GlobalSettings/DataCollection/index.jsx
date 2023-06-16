import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import { useState } from "react";
import SettingsItem from "../../SettingsItem";

const DataCollection = () => {
  const [dataCollectionStatus, setDataCollectionStatus] = useState(
    localStorage.getItem("dataCollectionStatus")
      ? localStorage.getItem("dataCollectionStatus") === "enabled"
      : "enabled" // Consider default enabled
  );

  const handleChange = () => {
    if (dataCollectionStatus === "enabled") {
      localStorage.setItem("dataCollectionStatus", "disabled");
      setDataCollectionStatus("disabled");
      trackSettingsToggled("data_collection", "disabled");
    } else {
      localStorage.setItem("dataCollectionStatus", "enabled");
      setDataCollectionStatus("enabled");
      trackSettingsToggled("data_collection", "enabled");
    }
  };
  return (
    <>
      <SettingsItem
        isActive={dataCollectionStatus === "enabled"}
        onChange={handleChange}
        title="Help improve Requestly"
        caption="Anonymous usage data helps the Requestly team prioritize fixes and features."
      />
    </>
  );
};

export default DataCollection;

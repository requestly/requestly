import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import RuleEditor from "./RuleEditor";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled, isSafariBrowser } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { useState } from "react";
import { getStoredPlacement } from "componentsV2/BottomSheet/context";

const RuleEditorView = () => {
  const appMode = useSelector(getAppMode);
  const [sheetPlacement, setSheetPlacement] = useState(() => {
    const savedPlacement = getStoredPlacement();
    return savedPlacement ?? BottomSheetPlacement.BOTTOM;
  });

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    if (isSafariBrowser()) {
      return <SafariLimitedSupportView />;
    }
    if (!isExtensionInstalled()) {
      return <InstallExtensionCTA />;
    }
  }

  return (
    <BottomSheetProvider setSheetPlacement={setSheetPlacement} sheetPlacement={sheetPlacement}>
      <RuleEditor />
    </BottomSheetProvider>
  );
};

export default RuleEditorView;

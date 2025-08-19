import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import RuleEditor from "./RuleEditor";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled, isSafariBrowser } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";

const RuleEditorView = () => {
  const appMode = useSelector(getAppMode);

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    if (isSafariBrowser()) {
      return <SafariLimitedSupportView />;
    }
    if (!isExtensionInstalled()) {
      return <InstallExtensionCTA />;
    }
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <RuleEditor />
    </BottomSheetProvider>
  );
};

export default RuleEditorView;

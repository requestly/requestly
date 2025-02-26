import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import RuleEditor from "./RuleEditor";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled, isSafariExtension } from "actions/ExtensionActions";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";

const RuleEditorView = () => {
  const appMode = useSelector(getAppMode);

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    if (!isExtensionInstalled()) {
      return <InstallExtensionCTA />;
    }
    if (isSafariExtension()) {
      return <SafariLimitedSupportView />;
    }
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM}>
      <RuleEditor />
    </BottomSheetProvider>
  );
};

export default RuleEditorView;

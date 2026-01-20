import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getUserRulesCount } from "store/selectors";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { isDesktopMode } from "utils/AppUtils";

const IS_PIN_EXTENSION_POPUP_ACTIVE = "is_rq_pin_extension_popup_active";

export const usePinExtensionPopup = () => {
  const rulesCount = useSelector(getUserRulesCount);

  const [isPinExtensionPopupActive, setIsPinExtensionPopupActive] = useState<boolean>(
    !isDesktopMode() &&
      isExtensionInstalled() &&
      (window.localStorage.getItem(IS_PIN_EXTENSION_POPUP_ACTIVE) !== null
        ? JSON.parse(window.localStorage.getItem(IS_PIN_EXTENSION_POPUP_ACTIVE)!)
        : rulesCount > 0)
  );

  const closePinExtensionPopup = useCallback(() => {
    setIsPinExtensionPopupActive(false);
    window.localStorage.setItem(IS_PIN_EXTENSION_POPUP_ACTIVE, "false");
  }, []);

  return { isPinExtensionPopupActive, closePinExtensionPopup };
};

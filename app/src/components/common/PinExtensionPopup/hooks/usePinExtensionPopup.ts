import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getAllRules } from "store/selectors";

const IS_PIN_EXTENSION_POPUP_ACTIVE = "is_rq_pin_extension_popup_active";

export const usePinExtensionPopup = () => {
  const allRules = useSelector(getAllRules);

  const [isPinExtensionPopupActive, setIsPinExtensionPopupActive] = useState<boolean>(
    JSON.parse(window.localStorage.getItem(IS_PIN_EXTENSION_POPUP_ACTIVE)) ?? allRules?.length > 0
  );

  const closePinExtensionPopup = useCallback(() => {
    setIsPinExtensionPopupActive(false);
    window.localStorage.setItem(IS_PIN_EXTENSION_POPUP_ACTIVE, "false");
  }, []);

  return { isPinExtensionPopupActive, closePinExtensionPopup };
};

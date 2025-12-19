import { useDispatch, useSelector } from "react-redux";
import SettingsItem from "../SettingsItem";
import { getUserAuthDetails, getIsOptedforAIFeatures } from "store/slices/global/user/selectors";
import { AIConsentModal } from "features/ai";
import { useState } from "react";
import { toggleAIFeatures } from "backend/user/toggleAIFeatures";
import { globalActions } from "store/slices/global/slice";
import { toast } from "utils/Toast";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import LINKS from "config/constants/sub/links";

export const AIConsentSetting = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isOptedforAIFeatures = useSelector(getIsOptedforAIFeatures);

  const [isAIConsentModalOpen, setIsAIConsentModalOpen] = useState(false);

  const isAIEnabledGlobally = useFeatureIsOn("global_ai_support");

  const handleDisableAIFeatures = async () => {
    const result = await toggleAIFeatures(user.details?.profile?.uid, false);
    if (result.success) {
      dispatch(globalActions.updateIsOptedforAIFeatures(false));
    } else toast.error(result.message);
  };

  if (!user.loggedIn) return null;

  return (
    <>
      <SettingsItem
        disabled={!isAIEnabledGlobally}
        title="AI features"
        caption={
          <>
            Enable AI-powered capabilities in the application. Learn how AI works in the{" "}
            <a href={LINKS.AI_DOC_LINK} target="_blank" rel="noreferrer">
              FAQs
            </a>
          </>
        }
        isActive={isOptedforAIFeatures}
        onChange={(checked) => {
          if (checked) {
            if (!isOptedforAIFeatures) {
              setIsAIConsentModalOpen(true);
              return;
            }
          } else handleDisableAIFeatures();
        }}
        toolTipTitle={
          !isAIEnabledGlobally ? (
            <>
              AI features are disabled for your organization, <a>Contact support</a>.
            </>
          ) : null
        }
      />
      <AIConsentModal isOpen={isAIConsentModalOpen} toggle={setIsAIConsentModalOpen} />
    </>
  );
};

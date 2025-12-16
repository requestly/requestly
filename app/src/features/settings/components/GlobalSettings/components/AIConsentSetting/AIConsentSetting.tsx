import { useDispatch, useSelector } from "react-redux";
import SettingsItem from "../SettingsItem";
import { getUserAuthDetails, getUserMetadata } from "store/slices/global/user/selectors";
import { AIConsentModal } from "features/ai";
import { useState } from "react";
import { toggleAIFeatures } from "backend/user/toggleAIFeatures";
import { globalActions } from "store/slices/global/slice";
import { toast } from "utils/Toast";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

export const AIConsentSetting = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userMetadata = useSelector(getUserMetadata);

  const [isAIConsentModalOpen, setIsAIConsentModalOpen] = useState(false);

  const isAISupportedGlobally = useFeatureIsOn("global_ai_support");

  const handleDisableAIFeatures = async () => {
    const result = await toggleAIFeatures(user.details?.profile?.uid, false);
    if (result.success) {
      dispatch(globalActions.updateUserMetadata({ ...userMetadata, ai_consent: false }));
    } else toast.error(result.message);
  };

  if (!user.loggedIn) return null;

  return (
    <>
      <SettingsItem
        disabled={!isAISupportedGlobally}
        title="AI features"
        caption={
          <>
            Enable AI-powered capabilities in the application. Learn how AI works in the <a>FAQs</a>
          </>
        }
        isActive={!!userMetadata?.ai_consent}
        onChange={(checked) => {
          if (checked) {
            if (!userMetadata?.ai_consent) {
              setIsAIConsentModalOpen(true);
              return;
            }
          } else handleDisableAIFeatures();
        }}
        toolTipTitle={
          !isAISupportedGlobally ? (
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

import React from "react";
import { Modal, Space } from "antd";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { PRICING } from "features/pricing/constants/pricing";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { trackCheckoutFailedEvent, trackCheckoutInitiatedEvent } from "modules/analytics/events/misc/business/checkout";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { actions } from "store";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { ChangePlanRequestConfirmationModal } from "../ChangePlanRequestConfirmationModal";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { trackPricingPlanCTAClicked } from "modules/analytics/events/misc/business";

const CTA_ONCLICK_FUNCTIONS = {
  MANAGE_SUBSCRIPTION: "manage-subscription",
  SWITCH_PLAN: "switch-plan",
  CHECKOUT: "checkout",
  USE_NOW: "use-now",
  CONTACT_US: "contact-us",
};

const CTA_BUTTONS_CONFIG = {
  "use-now": {
    text: "Use Now",
    tag: "Current Plan",
    onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
    visible: true,
  },
  checkout: {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
    visible: true,
  },
  "not-visible": {
    text: "Use Now",
    tag: "",
    onClick: () => {},
    visible: false,
  },
  "current-plan": {
    text: "",
    tag: "Current Plan",
    onClick: () => {},
    visible: false,
  },
  "manage-subscription": {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
    visible: true,
  },
  "switch-plan": {
    text: "Switch Plan",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
    visible: true,
  },
  "upgrade-email": {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
    visible: true,
  },
  "already-included": {
    text: "",
    tag: "Already included in team license",
    onClick: () => {},
    visible: false,
  },
  "trial-active": {
    text: "Upgrade",
    tag: "30 day trial active",
    onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
    visible: true,
  },
};

// Maps userPlanType/userPlanName -> columnPlanType/columnPlanName -> buttonConfig
const pricingButtonsMap: Record<string, any> = {
  individual: {
    [PRICING.PLAN_NAMES.FREE]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["use-now"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG.checkout,
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG.checkout,
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["use-now"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG.checkout,
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG.checkout,
      },
    },
    [PRICING.PLAN_NAMES.BASIC]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["current-plan"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["manage-subscription"],
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["upgrade-email"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["upgrade-email"],
      },
    },
    [PRICING.PLAN_NAMES.PROFESSIONAL]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["switch-plan"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["current-plan"],
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["upgrade-email"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["upgrade-email"],
      },
    },
  },
  team: {
    [PRICING.PLAN_NAMES.FREE]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["use-now"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG.checkout,
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG.checkout,
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["use-now"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG.checkout,
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG.checkout,
      },
    },
    [PRICING.PLAN_NAMES.BASIC]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["already-included"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["upgrade-email"],
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["current-plan"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["upgrade-email"],
      },
    },
    [PRICING.PLAN_NAMES.PROFESSIONAL]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["already-included"],
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
        [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["switch-plan"],
        [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["current-plan"],
      },
    },
  },
  trial: {
    individual: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG["manage-subscription"],
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG["trial-active"],
    },
    team: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG["not-visible"],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG.checkout,
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG.checkout,
    },
  },
};

interface PricingTableButtonsProps {
  columnPlanName: string;
  selectedWorkspace: any;
  product: string;
  duration: string;
  source: string;
  setIsContactUsModalOpen: (value: boolean) => void;
}

export const PricingTableButtons: React.FC<PricingTableButtonsProps> = ({
  columnPlanName,
  selectedWorkspace,
  product,
  duration,
  source,
  setIsContactUsModalOpen,
}) => {
  const dispatch = useDispatch();
  const firebaseFunction = getFunctions();
  const user = useSelector(getUserAuthDetails);

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirmationModalLoading, setIsConfirmationModalLoading] = useState(false);

  const isUserPremium = user?.details?.isPremium;
  const userPlanName = user?.details?.planDetails?.planName ?? PRICING.PLAN_NAMES.FREE;
  const userPlanType = ["team", "individual"].includes(user?.details?.planDetails?.type)
    ? user?.details?.planDetails?.type
    : "individual";
  const isPrivateWorkspaceSelected = selectedWorkspace?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id;
  const isUserTrialing = isUserPremium && user?.details?.planDetails?.status === "trialing";

  const onButtonClick = (functionName: string) => {
    trackPricingPlanCTAClicked(
      {
        current_plan: `${userPlanName} ${userPlanType}`,
        selected_plan: `${columnPlanName} ${isPrivateWorkspaceSelected ? "individual" : "team"}`,
        action: functionName,
      },
      source
    );
    setIsButtonLoading(true);
    if (!user?.details?.isLoggedIn) {
      dispatch(actions.toggleActiveModal({ modalName: "authModal", newValue: true }));
      setIsButtonLoading(false);
      return;
    }
    switch (functionName) {
      case CTA_ONCLICK_FUNCTIONS.USE_NOW: {
        window.location.href = "/";
        setIsButtonLoading(false);
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.CHECKOUT: {
        trackCheckoutInitiatedEvent(duration, columnPlanName, selectedWorkspace?.accessCount, isUserTrialing, source);
        dispatch(
          actions.toggleActiveModal({
            modalName: "pricingModal",
            newValue: true,
            newProps: {
              selectedPlan: columnPlanName,
              workspace: selectedWorkspace,
              planDuration: duration,
              source,
            },
          })
        );
        setIsButtonLoading(false);
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION: {
        trackCheckoutInitiatedEvent(duration, columnPlanName, selectedWorkspace?.accessCount, isUserTrialing, source);
        const manageSubscription = httpsCallable(firebaseFunction, "subscription-manageSubscription");
        manageSubscription({
          planName: columnPlanName,
          duration,
        })
          .then((res: any) => {
            if (res?.data?.success) {
              window.location.href = res?.data?.data?.portalUrl;
            }
          })
          .catch((err) => {
            toast.error("Error in managing subscription. Please contact support contact@requestly.io");
            trackCheckoutFailedEvent(isPrivateWorkspaceSelected ? "individual" : "team", source);
          })
          .finally(() => {
            setIsButtonLoading(false);
          });
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN: {
        Modal.confirm({
          title: "Switch Plan",
          content: `You are about to switch from ${getPrettyPlanName(
            userPlanName
          )} (${userPlanType}) plan to ${getPrettyPlanName(columnPlanName)} (${
            isPrivateWorkspaceSelected ? "individual" : "team"
          }) plan.`,
          okText: "Yes",
          okType: "primary",
          cancelText: "No",
          onOk: () => {
            setIsConfirmationModalOpen(true);
            setIsConfirmationModalLoading(true);
            const requestPlanSwitch = httpsCallable(firebaseFunction, "premiumNotifications-requestPlanSwitch");
            requestPlanSwitch({
              currentPlan: userPlanName,
              currentPlanType: userPlanType,
              planToSwitch: columnPlanName,
              planToSwitchType: isPrivateWorkspaceSelected ? "individual" : "team",
            })
              .catch(() => {
                toast.error("Error in switching plan. Please contact support");
                setIsConfirmationModalOpen(false);
              })
              .finally(() => {
                setIsConfirmationModalLoading(false);
                setIsButtonLoading(false);
              });
          },
          onCancel: () => {
            setIsButtonLoading(false);
          },
        });
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.CONTACT_US: {
        setIsContactUsModalOpen(true);
        break;
      }
    }
  };

  let buttonConfig =
    pricingButtonsMap[userPlanType][userPlanName][isPrivateWorkspaceSelected ? "individual" : "team"][columnPlanName];

  if (isUserTrialing) {
    buttonConfig = pricingButtonsMap.trial[isPrivateWorkspaceSelected ? "individual" : "team"][columnPlanName];
  }

  if (product === PRICING.PRODUCTS.SESSION_REPLAY) {
    if (columnPlanName === PRICING.PLAN_NAMES.FREE) {
      return (
        <Space size={8}>
          <RQButton onClick={() => (window.location.href = "/")} type="primary">
            Use now
          </RQButton>
          <div className="current-pricing-plan-tag">Current Plan</div>
        </Space>
      );
    }

    return (
      <RQButton
        onClick={() => {
          onButtonClick(CTA_ONCLICK_FUNCTIONS.CONTACT_US);
        }}
        type="primary"
      >
        Contact us
      </RQButton>
    );
  }

  if (columnPlanName === PRICING.PLAN_NAMES.ENTERPRISE) {
    return (
      <RQButton
        onClick={() => {
          onButtonClick(CTA_ONCLICK_FUNCTIONS.CONTACT_US);
        }}
        type="primary"
      >
        Contact us
      </RQButton>
    );
  }

  return (
    <>
      <Space size={8}>
        {buttonConfig?.text && (
          <RQButton
            onClick={() => {
              onButtonClick(buttonConfig.onClick);
            }}
            type="primary"
            className={!buttonConfig.visible ? "visibility-hidden" : ""}
            loading={isButtonLoading}
          >
            {buttonConfig?.text}
          </RQButton>
        )}
        {buttonConfig.tag && <div className="current-pricing-plan-tag">{buttonConfig.tag}</div>}
      </Space>
      <ChangePlanRequestConfirmationModal
        isOpen={isConfirmationModalOpen}
        handleToggle={() => setIsConfirmationModalOpen(false)}
        isLoading={isConfirmationModalLoading}
      />
    </>
  );
};

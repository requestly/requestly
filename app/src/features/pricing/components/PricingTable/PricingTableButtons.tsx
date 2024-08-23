import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { PRICING } from "features/pricing/constants/pricing";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import {
  trackCheckoutFailedEvent,
  trackCheckoutButtonClicked,
  trackCheckoutInitiated,
} from "modules/analytics/events/misc/business/checkout";
import { useState } from "react";
import { actions } from "store";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { ChangePlanRequestConfirmationModal } from "../ChangePlanRequestConfirmationModal";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { trackPricingPlanCTAClicked } from "modules/analytics/events/misc/business";
import APP_CONSTANTS from "config/constants";
import { redirectToPricingPlans } from "utils/RedirectionUtils";

const CTA_ONCLICK_FUNCTIONS = {
  MANAGE_SUBSCRIPTION: "manage-subscription",
  SWITCH_PLAN: "switch-plan",
  CHECKOUT: "checkout",
  USE_NOW: "use-now",
  CONTACT_US: "contact-us",
  SIGNUP: "signup",
};

enum CTA_CONFIG_SELECTORS {
  SIGNUP = "signup",
  USE_NOW = "use-now",
  CHECKOUT = "checkout",
  NOT_VISIBLE = "not-visible",
  CURRENT_PLAN = "current-plan",
  MANAGE_SUBSCRIPTION = "manage-subscription",
  SWITCH_PLAN = "switch-plan",
  UPGRADE = "upgrade",
  ALREADY_INCLUDED = "already-included",
  TRIAL_ACTIVE = "trial-active",
}

const CTA_BUTTONS_CONFIG = {
  [CTA_CONFIG_SELECTORS.SIGNUP]: {
    text: "Sign Up",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.SIGNUP,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.USE_NOW]: {
    text: "Use Now",
    tag: "Current Plan",
    onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.CHECKOUT]: {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.NOT_VISIBLE]: {
    text: "Use Now",
    tag: "",
    onClick: () => {},
    visible: false,
  },
  [CTA_CONFIG_SELECTORS.CURRENT_PLAN]: {
    text: "",
    tag: "Current Plan",
    onClick: () => {},
    visible: false,
  },
  [CTA_CONFIG_SELECTORS.MANAGE_SUBSCRIPTION]: {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.SWITCH_PLAN]: {
    text: "Switch Plan",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.UPGRADE]: {
    text: "Upgrade",
    tag: "",
    onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
    visible: true,
  },
  [CTA_CONFIG_SELECTORS.ALREADY_INCLUDED]: {
    text: "",
    tag: "Already included in team license",
    onClick: () => {},
    visible: false,
  },
  [CTA_CONFIG_SELECTORS.TRIAL_ACTIVE]: {
    text: "Upgrade",
    tag: "30 day trial active",
    onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
    visible: true,
  },
};

// Maps userPlanName -> columnPlanName -> buttonConfig
const pricingButtonsMap: Record<string, any> = {
  default: {
    [PRICING.PLAN_NAMES.FREE]: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.USE_NOW],
      [PRICING.PLAN_NAMES.LITE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CHECKOUT],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CHECKOUT],
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CHECKOUT],
    },
    [PRICING.PLAN_NAMES.LITE]: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.NOT_VISIBLE],
      [PRICING.PLAN_NAMES.LITE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CURRENT_PLAN],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.UPGRADE],
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.UPGRADE],
    },
    [PRICING.PLAN_NAMES.BASIC]: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.NOT_VISIBLE],
      [PRICING.PLAN_NAMES.LITE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.SWITCH_PLAN],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CURRENT_PLAN],
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.UPGRADE],
    },
    [PRICING.PLAN_NAMES.PROFESSIONAL]: {
      [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.NOT_VISIBLE],
      [PRICING.PLAN_NAMES.LITE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.SWITCH_PLAN],
      [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.SWITCH_PLAN],
      [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.CURRENT_PLAN],
    },
  },
  trial: {
    [PRICING.PLAN_NAMES.FREE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.NOT_VISIBLE],
    [PRICING.PLAN_NAMES.LITE]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.MANAGE_SUBSCRIPTION],
    [PRICING.PLAN_NAMES.BASIC]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.MANAGE_SUBSCRIPTION],
    [PRICING.PLAN_NAMES.PROFESSIONAL]: CTA_BUTTONS_CONFIG[CTA_CONFIG_SELECTORS.MANAGE_SUBSCRIPTION],
  },
};

interface PricingTableButtonsProps {
  columnPlanName: string;
  product: string;
  duration: string;
  source: string;
  quantity: number;
  disabled: boolean;
  setIsContactUsModalOpen: (value: boolean) => void;
}

export const PricingTableButtons: React.FC<PricingTableButtonsProps> = ({
  columnPlanName,
  product,
  duration,
  source,
  quantity,
  disabled,
  setIsContactUsModalOpen,
}) => {
  const dispatch = useDispatch();
  const firebaseFunction = getFunctions();
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirmationModalLoading, setIsConfirmationModalLoading] = useState(false);

  const isUserPremium = user?.details?.isPremium;
  const userPlanName = user?.details?.planDetails?.planName ?? PRICING.PLAN_NAMES.FREE;
  const isUserTrialing = isUserPremium && user?.details?.planDetails?.status === "trialing";
  const userPlanType = ["team", "individual"].includes(user?.details?.planDetails?.type)
    ? user?.details?.planDetails?.type
    : "individual";

  const onButtonClick = (functionName: string) => {
    trackPricingPlanCTAClicked(
      {
        current_plan: `${userPlanName}`,
        selected_plan: `${columnPlanName}`,
        action: functionName,
        quantity,
      },
      source
    );
    setIsButtonLoading(true);
    if (!user?.details?.isLoggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            callback: () => redirectToPricingPlans(navigate),
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            eventSource: "pricing_table",
          },
        })
      );
      setIsButtonLoading(false);
      return;
    }
    switch (functionName) {
      case CTA_ONCLICK_FUNCTIONS.USE_NOW: {
        window.location.href = "/";
        setIsButtonLoading(false);
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.SIGNUP: {
        dispatch(
          actions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
              callback: () => redirectToPricingPlans(navigate),
              eventSource: "pricing_table",
            },
          })
        );
        setIsButtonLoading(false);
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.CHECKOUT: {
        trackCheckoutButtonClicked(duration, columnPlanName, quantity, isUserTrialing, source);
        dispatch(
          actions.toggleActiveModal({
            modalName: "pricingModal",
            newValue: true,
            newProps: {
              selectedPlan: columnPlanName,
              planDuration: duration,
              quantity,
              source,
            },
          })
        );
        setIsButtonLoading(false);
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION: {
        trackCheckoutButtonClicked(duration, columnPlanName, quantity, isUserTrialing, source);
        const manageSubscription = httpsCallable(firebaseFunction, "subscription-manageSubscription");
        manageSubscription({
          planName: columnPlanName,
          duration,
          portalFlowType: "update_subscription",
        })
          .then((res: any) => {
            if (res?.data?.success) {
              window.location.href = res?.data?.data?.portalUrl;

              trackCheckoutInitiated({
                plan_name: columnPlanName,
                duration,
                currency: "usd",
                quantity: quantity,
                is_user_on_trial: isUserTrialing,
                source,
              });
            }
          })
          .catch((err) => {
            toast.error("Error in managing subscription. Please contact support contact@requestly.io");
            trackCheckoutFailedEvent(quantity, source);
          })
          .finally(() => {
            setIsButtonLoading(false);
          });
        break;
      }
      case CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN: {
        Modal.confirm({
          title: "Switch Plan",
          content: `You are about to switch from ${getPrettyPlanName(userPlanName)} plan to ${getPrettyPlanName(
            columnPlanName
          )} plan.`,
          okText: "Yes",
          okType: "primary",
          cancelText: "No",
          onOk: () => {
            setIsConfirmationModalOpen(true);
            setIsConfirmationModalLoading(true);
            const requestPlanSwitch = httpsCallable(firebaseFunction, "premiumNotifications-requestPlanSwitch");
            requestPlanSwitch({
              currentPlan: userPlanName,
              planToSwitch: columnPlanName,
              currentPlanType: userPlanType,
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
      default: {
        setIsButtonLoading(false);
      }
    }
  };

  let buttonConfig = pricingButtonsMap.default[userPlanName][columnPlanName];

  if (buttonConfig?.onClick === CTA_ONCLICK_FUNCTIONS.USE_NOW && !user?.details?.isLoggedIn) {
    buttonConfig = CTA_BUTTONS_CONFIG["signup"];
  }

  if (isUserTrialing) {
    buttonConfig = pricingButtonsMap.trial[columnPlanName];
    if (quantity > 1) {
      buttonConfig = CTA_BUTTONS_CONFIG["checkout"];
    }
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
        Schedule a call
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
            disabled={disabled}
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

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

const CTA_ONCLICK_FUNCTIONS = {
  MANAGE_SUBSCRIPTION: "manage-subscription",
  SWITCH_PLAN: "switch-plan",
  CHECKOUT: "checkout",
  USE_NOW: "use-now",
  CONTACT_US: "contact-us",
};

// Maps userPlanType/userPlanName -> columnPlanType/columnPlanName -> buttonConfig
const pricingButtonsMap: Record<string, any> = {
  individual: {
    [PRICING.PLAN_NAMES.FREE]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use Now",
          tag: "Current Plan",
          onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
          visible: true,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use Now",
          tag: "Current Plan",
          onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
          visible: true,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
    },
    [PRICING.PLAN_NAMES.BASIC]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use Now",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "",
          tag: "Current Plan",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
          visible: true,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use now",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
      },
    },
    [PRICING.PLAN_NAMES.PROFESSIONAL]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Switch Plan",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "",
          tag: "Current Plan",
          onClick: () => {},
          visible: false,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
      },
    },
  },
  team: {
    [PRICING.PLAN_NAMES.FREE]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use Now",
          tag: "Current Plan",
          onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
          visible: true,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Use Now",
          tag: "Current Plan",
          onClick: CTA_ONCLICK_FUNCTIONS.USE_NOW,
          visible: true,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
    },
    [PRICING.PLAN_NAMES.BASIC]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "",
          tag: "Already included in team license",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "",
          tag: "Current Plan",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "Upgrade",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
          visible: true,
        },
      },
    },
    [PRICING.PLAN_NAMES.PROFESSIONAL]: {
      individual: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "",
          tag: "Already included in team license",
          onClick: () => {},
          visible: false,
        },
      },
      team: {
        [PRICING.PLAN_NAMES.FREE]: {
          text: "Upgrade",
          tag: "",
          onClick: () => {},
          visible: false,
        },
        [PRICING.PLAN_NAMES.BASIC]: {
          text: "Switch Plan",
          tag: "",
          onClick: CTA_ONCLICK_FUNCTIONS.SWITCH_PLAN,
          visible: true,
        },
        [PRICING.PLAN_NAMES.PROFESSIONAL]: {
          text: "",
          tag: "Current Plan",
          onClick: () => {},
          visible: false,
        },
      },
    },
  },
  trial: {
    individual: {
      [PRICING.PLAN_NAMES.FREE]: {
        text: "Upgrade",
        tag: "",
        onClick: () => {},
        visible: false,
      },
      [PRICING.PLAN_NAMES.BASIC]: {
        text: "Upgrade",
        tag: "",
        onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
        visible: true,
      },
      [PRICING.PLAN_NAMES.PROFESSIONAL]: {
        text: "Upgrade",
        tag: "30 day trial on",
        onClick: CTA_ONCLICK_FUNCTIONS.MANAGE_SUBSCRIPTION,
        visible: true,
      },
    },
    team: {
      [PRICING.PLAN_NAMES.FREE]: {
        text: "Upgrade",
        tag: "",
        onClick: () => {},
        visible: false,
      },
      [PRICING.PLAN_NAMES.BASIC]: {
        text: "Upgrade",
        tag: "",
        onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
        visible: true,
      },
      [PRICING.PLAN_NAMES.PROFESSIONAL]: {
        text: "Upgrade",
        tag: "30 day trial on",
        onClick: CTA_ONCLICK_FUNCTIONS.CHECKOUT,
        visible: true,
      },
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

  const isUserPremium = user?.details?.isPremium;
  const userPlanName = user?.details?.planDetails?.planName ?? PRICING.PLAN_NAMES.FREE;
  const userPlanType = user?.details?.planDetails?.type ?? "individual";
  const isPrivateWorkspaceSelected = selectedWorkspace?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id;
  const isUserTrialing = isUserPremium && user?.details?.planDetails?.status === "trialing";

  const onButtonClick = (functionName: string) => {
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
          content: `You are about to switch from ${userPlanName} to ${columnPlanName} plan.`,
          okText: "Yes",
          okType: "danger",
          cancelText: "No",
          onOk: () => {
            const requestPlanSwitch = httpsCallable(firebaseFunction, "premiumNotifications-requestPlanSwitch");
            requestPlanSwitch({
              currentPlan: userPlanName,
              currentPlanType: userPlanType,
              planToSwitch: columnPlanName,
              planToSwitchType: isPrivateWorkspaceSelected ? "individual" : "team",
            })
              .then(() => {
                setIsConfirmationModalOpen(true);
              })
              .catch(() => {
                toast.error("Error in switching plan. Please contact support");
              })
              .finally(() => {
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
      />
    </>
  );
};

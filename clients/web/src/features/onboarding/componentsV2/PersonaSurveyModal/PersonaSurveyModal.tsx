import { Modal, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getIsNewUser } from "store/selectors";
import { PiSealCheckFill } from "@react-icons/all-files/pi/PiSealCheckFill";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { TiArrowRight } from "@react-icons/all-files/ti/TiArrowRight";
import { useEffect, useRef, useState } from "react";
import { globalActions } from "store/slices/global/slice";
import "./personaSurveyModal.scss";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { trackPersonaSurveyCompleted, trackPersonaSurveyViewed } from "features/onboarding/analytics";
import { snakeCase } from "lodash";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";

const PersonaSurvey = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [selectedPersona, setSelectedPersona] = useState("Front-end developer");

  const options = useRef([
    "Front-end developer",
    "QA engineer",
    "Back-end developer",
    "Product manager",
    "Founder/CEO",
    "Engineering lead/Manager",
    "IT administrator",
    "Sales",
  ]);

  useEffect(() => {
    trackPersonaSurveyViewed();
  }, []);

  const handleContinue = () => {
    dispatch(globalActions.updateNewUserPersona(selectedPersona));
    submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, selectedPersona);
    trackPersonaSurveyCompleted(snakeCase(selectedPersona));
    dispatch(globalActions.updateIsNewUser(false));
  };

  return (
    <>
      <div className="rq-persona-survey-modal__title">
        <PiSealCheckFill /> <span> Welcome, {user.details?.profile.displayName}! You're signed in successfully</span>
      </div>
      <div className="rq-persona-survey-modal__description">Help us in optimizing your experience</div>
      <Radio.Group
        className="persona-options-container"
        value={selectedPersona}
        onChange={(e) => setSelectedPersona(e.target.value)}
      >
        {options.current.map((option) => (
          <Radio className="persona-option" key={option} value={option}>
            {option}
          </Radio>
        ))}
      </Radio.Group>
      <div className="rq-persona-survey-modal-footer">
        <RQButton type="primary" icon={<TiArrowRight />} onClick={handleContinue}>
          Continue
        </RQButton>
      </div>
    </>
  );
};

export const PersonaSurveyModal = () => {
  const location = useLocation();
  const isNewUser = useSelector(getIsNewUser);
  const user = useSelector(getUserAuthDetails);

  if (!user.loggedIn) {
    return null;
  }

  if (location.pathname.includes(PATHS.AUTH.LOGIN.RELATIVE)) {
    return null;
  }

  if (!isNewUser) {
    return null;
  }

  return (
    <Modal
      open={true}
      footer={null}
      className="rq-persona-survey-modal"
      closable={false}
      maskStyle={{ background: "rgba(0, 0, 0, 0.7)" }}
    >
      <PersonaSurvey />
    </Modal>
  );
};

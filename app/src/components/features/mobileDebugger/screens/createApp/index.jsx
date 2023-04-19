import { Col, Row, Steps } from "antd";
import ProCard from "@ant-design/pro-card";
import { useState } from "react";
import CreateAppStep from "./steps/CreateAppStep";
import IntegrateCodeStep from "./steps/IntegrateCodeStep";
import TestIntegrationStep from "./steps/TestIntegrationStep";
import LoadingStep from "./steps/LoadingStep";
import { getFunctions, httpsCallable } from "firebase/functions";
import { redirectToMobileDebuggerInterceptor } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import {
  trackSdkKeyCreatedEvent,
  trackSdkKeyCreatedFailureEvent,
} from "modules/analytics/events/features/mobileDebugger";

const { Step } = Steps;

const CreateApp = (props) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [sdkKey, setSdkKey] = useState(null);
  const [platformId, setPlatformId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const renderSteps = () => {
    return (
      <ProCard>
        <Steps direction="vertical" size="small" current={currentStep}>
          <Step title="Create App" />
          <Step title="Integrate the SDK" />
          <Step title="Test the integration" />
        </Steps>
      </ProCard>
    );
  };

  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingStep />;
    }

    switch (currentStep) {
      case 0:
        return <CreateAppStep nextHandler={nextHandler} backHandler={backHandler} />;
      case 1:
        return (
          <IntegrateCodeStep
            nextHandler={nextHandler}
            backHandler={backHandler}
            sdkKey={sdkKey}
            platformId={platformId}
          />
        );
      case 2:
        return <TestIntegrationStep nextHandler={nextHandler} backHandler={backHandler} />;
      default:
        return null;
    }
  };

  const backHandler = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextHandler = async (name = null, platformId = null) => {
    if (currentStep === 0) {
      setPlatformId(platformId);
      setIsLoading(true);

      const sdkDetails = await createNewApp(name, platformId);
      setIsLoading(false);
      if (sdkDetails && sdkDetails.id) {
        setSdkKey(sdkDetails.id);
      } else {
        return;
      }
    }

    if (currentStep <= 1) {
      setCurrentStep(currentStep + 1);
    } else {
      redirectToMobileDebuggerInterceptor(navigate, sdkKey);
    }
  };

  const createNewApp = async (name, platformId) => {
    setIsLoading(true);

    const functions = getFunctions();
    const createNewSdkApp = httpsCallable(functions, "createNewSdkApp");
    const resp = await createNewSdkApp({
      name: name,
      platform: platformId,
    })
      .then((response) => {
        if (response.success === false) {
          trackSdkKeyCreatedFailureEvent();
          return {};
        }

        trackSdkKeyCreatedEvent(response?.data?.id, response?.data?.name, response?.data?.platform);
        return response;
      })
      .catch((err) => {
        trackSdkKeyCreatedFailureEvent();
        return {};
      });

    return resp.data;
  };

  return (
    <Row gutter={16}>
      <Col span={5} className="primary-card">
        {renderSteps()}
      </Col>
      <Col span={19} className="primary-card">
        {renderStepContent()}
      </Col>
    </Row>
  );
};

export default CreateApp;

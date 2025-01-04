import React, { useState } from "react";
import { Steps } from "antd"; // Import Steps from antd instead of RQSteps
import { RQButton } from "lib/design-system-v2/components";
import "./createTranslation.scss";

const CreateTranslation = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // These steps define our translation process
  // We're using the same structure but adapting it for Ant Design's Steps
  const steps = [
    {
      title: "API Configuration",
      description: "Configure your REST API endpoints",
    },
    {
      title: "Endpoint Analysis",
      description: "Review and customize endpoint relationships",
    },
    {
      title: "Schema Preview",
      description: "Preview and adjust your GraphQL schema",
    },
    {
      title: "Testing & Deploy",
      description: "Test and deploy your GraphQL endpoint",
    },
  ];

  // Navigation handlers remain the same
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content remains the same
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <div>API Configuration Step (Coming soon)</div>;
      case 1:
        return <div>Endpoint Analysis Step (Coming soon)</div>;
      case 2:
        return <div>Schema Preview Step (Coming soon)</div>;
      case 3:
        return <div>Testing & Deploy Step (Coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="create-translation-container">
      {/* Header section with title and progress */}
      <div className="create-translation-header">
        <h1>Create GraphQL Translation</h1>
        <p>Transform your REST API into a GraphQL endpoint</p>
      </div>

      {/* Replace RQSteps with Ant Design Steps */}
      <div className="create-translation-steps">
        <Steps
          current={currentStep}
          items={steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
          className="translation-steps"
        />
      </div>

      {/* Main content area */}
      <div className="create-translation-content">{renderStepContent()}</div>

      {/* Navigation buttons */}
      <div className="create-translation-actions">
        {currentStep > 0 && <RQButton onClick={handlePrevious}>Previous</RQButton>}

        <RQButton type="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Deploy" : "Next"}
        </RQButton>
      </div>
    </div>
  );
};

export default CreateTranslation;

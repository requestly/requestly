// app/src/features/graphify/screens/graphify/translation/components/createTranslation/index.jsx

import React, { useState } from "react";
import { Steps } from "antd";
import APIConfiguration from "../apiConfiguration";
import EndpointAnalysis from "../endpointAnalysis";
import SchemaPreview from "../schemaPreview";
import "./createTranslation.scss";

const CreateTranslation = () => {
  // Track the current step in the translation process
  const [currentStep, setCurrentStep] = useState(0);

  // Store the data from each step to pass it forward
  const [translationData, setTranslationData] = useState({
    apiConfig: null, // Data from step 1: API Configuration
    endpoints: null, // Data from step 2: Endpoint Analysis
    schema: null, // Data from step 3: Schema Preview
  });

  // Define the steps in our translation process
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

  // Handle moving to the next step when a step is completed
  const handleStepComplete = (stepData) => {
    // Store the data from the current step
    const newTranslationData = { ...translationData };
    switch (currentStep) {
      case 0:
        newTranslationData.apiConfig = stepData;
        break;
      case 1:
        newTranslationData.endpoints = stepData;
        break;
      case 2:
        newTranslationData.schema = stepData;
        break;
      default:
        break;
    }
    setTranslationData(newTranslationData);

    // Move to the next step
    setCurrentStep(currentStep + 1);
  };

  // Handle going back to the previous step
  const handleStepBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render the current step's content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <APIConfiguration
            onNext={handleStepComplete}
            // Pass initial data if user comes back to this step
            initialData={translationData.apiConfig}
          />
        );
      case 1:
        return (
          <EndpointAnalysis
            apiConfig={translationData.apiConfig}
            onNext={handleStepComplete}
            onPrevious={handleStepBack}
            // Pass initial data if user comes back to this step
            initialData={translationData.endpoints}
          />
        );
      case 2:
        return (
          <SchemaPreview
            endpointData={translationData.endpoints}
            onNext={handleStepComplete}
            onPrevious={handleStepBack}
            // Pass initial data if user comes back to this step
            initialData={translationData.schema}
          />
        );
      case 3:
        // We'll implement the Testing component next
        return <div>Testing & Deploy (Coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="create-translation-container">
      <div className="create-translation-header">
        <h1>Create GraphQL Translation</h1>
        <p>Transform your REST API into a GraphQL endpoint</p>
      </div>

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

      <div className="create-translation-content">{renderStepContent()}</div>
    </div>
  );
};

export default CreateTranslation;

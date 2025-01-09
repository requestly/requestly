// app/src/features/graphify/screens/graphify/translation/components/createTranslation/index.jsx

import React, { useState } from "react";
import { Steps } from "antd";
import { useGraphify } from "hooks/graphify/useGraphify";
import APIConfiguration from "../apiConfiguration";
import EndpointAnalysis from "../endpointAnalysis";
import SchemaPreview from "../schemaPreview";
import TestingDeploy from "../testingDeploy";
import "./createTranslation.scss";

const CreateTranslation = () => {
  // Track the current step and all data from the translation process
  const [currentStep, setCurrentStep] = useState(0);
  const [translationData, setTranslationData] = useState({
    apiConfig: null, // From API Configuration step
    endpoints: null, // From Endpoint Analysis step
    analysisId: null, // From our Firebase Function
    schema: null, // From Schema Preview step
  });

  // Get our Graphify functions
  const { analyzeAPI, executeQuery, isAnalyzing } = useGraphify();

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
  const handleStepComplete = async (stepData) => {
    const newTranslationData = { ...translationData };
    const result = await analyzeAPI(
      stepData.baseURL,
      stepData.authType !== "none"
        ? {
            type: stepData.authType,
            token: stepData.authDetails.apiKey,
            headerName: stepData.authDetails.headerName,
          }
        : undefined
    );

    switch (currentStep) {
      case 0: // API Configuration
        try {
          // When API config is done, analyze the API

          // Store both the config and analysis results
          newTranslationData.apiConfig = stepData;
          newTranslationData.endpoints = result.endpoints; // Real endpoints from API analysis
          newTranslationData.analysisId = result.analysisId;
          setTranslationData(newTranslationData);
          setCurrentStep(currentStep + 1);
        } catch (error) {
          // Show error to user
          console.error("API analysis failed:", error);
        }
        break;

      case 1: // Endpoint Analysis
        // Store selected endpoints and move to schema preview
        newTranslationData.endpoints = stepData.endpoints;
        newTranslationData.schema = result.schema;
        setCurrentStep(currentStep + 1);
        break;

      case 2: // Schema Preview
        // Store schema and move to testing
        newTranslationData.schema = stepData;
        setCurrentStep(currentStep + 1);
        break;

      default:
        break;
    }

    setTranslationData(newTranslationData);
  };

  // Handle going back to previous step
  const handleStepBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <APIConfiguration onNext={handleStepComplete} initialData={translationData.apiConfig} />;
      case 1:
        return (
          <EndpointAnalysis
            apiConfig={translationData.apiConfig}
            endpoints={translationData.endpoints}
            onNext={handleStepComplete}
            onPrevious={handleStepBack}
            isLoading={isAnalyzing}
          />
        );
      case 2:
        return (
          <SchemaPreview
            endpointData={translationData.endpoints}
            onNext={handleStepComplete}
            onPrevious={handleStepBack}
          />
        );
      case 3:
        return (
          <TestingDeploy
            schemaData={translationData.schema}
            analysisId={translationData.analysisId}
            executeQuery={executeQuery}
            onPrevious={handleStepBack}
          />
        );
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

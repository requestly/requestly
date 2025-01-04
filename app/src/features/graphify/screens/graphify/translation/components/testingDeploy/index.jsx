// app/src/features/graphify/screens/graphify/translation/components/testingDeploy/index.jsx

import React, { useState, useEffect } from "react";
import { Tabs, Alert, Card, Input, Switch, Space, Spin } from "antd";
import { GraphiQLWithExplorer } from "graphiql";
import "graphiql/graphiql.min.css";
import "./testingDeploy.scss";
import { RQButton } from "lib/design-system-v2/components";

// This component provides an interactive environment for testing the GraphQL API
// and deploying it for production use. It shows users exactly how their GraphQL
// queries translate to REST API calls in real-time.

const TestingDeploy = ({ schemaData, endpointData, apiConfig, onDeploy, onPrevious }) => {
  // Track the testing and deployment states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    endpoint: `graphql-${generateRandomString(6)}`,
    cacheEnabled: true,
    rateLimitEnabled: true,
    rateLimit: 100,
  });
  const [lastTestQuery, setLastTestQuery] = useState(null);
  const [lastRestCalls, setLastRestCalls] = useState([]);

  // GraphiQL requires a fetcher function that executes GraphQL queries
  const graphQLFetcher = async (graphQLParams) => {
    try {
      // Store the query for showing REST translation
      setLastTestQuery(graphQLParams.query);

      // Here we'll translate the GraphQL query to REST calls
      // For now, we'll simulate this process
      const restCalls = await simulateRestCalls(graphQLParams.query, endpointData);
      setLastRestCalls(restCalls);

      // Execute the actual REST calls and return the result
      // This is a simulation for now
      return await executeRestCalls(restCalls, apiConfig);
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  };

  // Simulate how a GraphQL query would translate to REST calls
  const simulateRestCalls = async (query, endpoints) => {
    // In production, this would actually analyze the query and determine
    // which REST endpoints need to be called. For now, we'll simulate it.
    await new Promise((resolve) => setTimeout(resolve, 500));

    return endpoints.slice(0, 2).map((endpoint) => ({
      method: endpoint.method,
      url: `${apiConfig.baseURL}${endpoint.path}`,
      headers: {
        Authorization: "Bearer ...",
        "Content-Type": "application/json",
      },
    }));
  };

  // Simulate executing REST calls and returning formatted data
  const executeRestCalls = async (calls, config) => {
    // In production, this would make actual REST API calls
    // For now, return mock data
    await new Promise((resolve) => setTimeout(resolve, 700));

    return {
      data: {
        users: [
          { id: 1, name: "Test User", email: "test@example.com" },
          { id: 2, name: "Another User", email: "another@example.com" },
        ],
      },
    };
  };

  // Handle deployment of the GraphQL API
  const handleDeploy = async () => {
    try {
      setIsDeploying(true);

      // Here we would actually deploy the API
      // For now, simulate deployment time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onDeploy({
        ...deploymentConfig,
        url: `https://${deploymentConfig.endpoint}.graphify.requestly.io`,
      });
    } catch (error) {
      console.error("Deployment error:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  // Generate a random string for endpoint URL suggestions
  const generateRandomString = (length) => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  };

  // Render the REST calls that were made for the last GraphQL query
  const renderRestCalls = () => {
    if (!lastRestCalls.length) {
      return <Alert type="info" message="Execute a GraphQL query to see how it translates to REST calls" showIcon />;
    }

    return lastRestCalls.map((call, index) => (
      <Card key={index} size="small" className="rest-call-card" title={`REST Call ${index + 1}`}>
        <pre className="rest-call-details">{JSON.stringify(call, null, 2)}</pre>
      </Card>
    ));
  };

  return (
    <div className="testing-deploy">
      <Tabs
        defaultActiveKey="testing"
        items={[
          {
            key: "testing",
            label: "Test Queries",
            children: (
              <div className="testing-section">
                <div className="graphiql-wrapper">
                  <GraphiQLWithExplorer
                    fetcher={graphQLFetcher}
                    schema={schemaData}
                    defaultQuery={`
                      # Try a sample query
                      query {
                        users {
                          id
                          name
                          email
                        }
                      }
                    `}
                  />
                </div>
                <div className="rest-calls-section">
                  <h3>REST API Calls</h3>
                  {renderRestCalls()}
                </div>
              </div>
            ),
          },
          {
            key: "deploy",
            label: "Deploy API",
            children: (
              <div className="deploy-section">
                <Card title="Deployment Configuration">
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="config-item">
                      <Input
                        addonBefore="https://"
                        addonAfter=".graphify.requestly.io"
                        value={deploymentConfig.endpoint}
                        onChange={(e) =>
                          setDeploymentConfig({
                            ...deploymentConfig,
                            endpoint: e.target.value,
                          })
                        }
                        placeholder="Enter endpoint name"
                      />
                    </div>

                    <div className="config-item">
                      <Space>
                        <Switch
                          checked={deploymentConfig.cacheEnabled}
                          onChange={(checked) =>
                            setDeploymentConfig({
                              ...deploymentConfig,
                              cacheEnabled: checked,
                            })
                          }
                        />
                        <span>Enable Response Caching</span>
                      </Space>
                    </div>

                    <div className="config-item">
                      <Space>
                        <Switch
                          checked={deploymentConfig.rateLimitEnabled}
                          onChange={(checked) =>
                            setDeploymentConfig({
                              ...deploymentConfig,
                              rateLimitEnabled: checked,
                            })
                          }
                        />
                        <span>Enable Rate Limiting</span>
                      </Space>
                      {deploymentConfig.rateLimitEnabled && (
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={deploymentConfig.rateLimit}
                          onChange={(e) =>
                            setDeploymentConfig({
                              ...deploymentConfig,
                              rateLimit: parseInt(e.target.value, 10),
                            })
                          }
                          style={{ marginTop: 8 }}
                          addonAfter="requests per minute"
                        />
                      )}
                    </div>
                  </Space>
                </Card>

                <div className="deploy-actions">
                  <RQButton onClick={onPrevious}>Back</RQButton>
                  <RQButton type="primary" onClick={handleDeploy} loading={isDeploying}>
                    Deploy GraphQL API
                  </RQButton>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default TestingDeploy;
